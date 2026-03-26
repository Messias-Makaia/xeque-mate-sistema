import { PrismaClient, Prisma, StatusPeriodo } from "@prisma/client";
import {criarPeriodosFiscais} from "./criarExercicio";

const prisma = new PrismaClient();

export async function executarEncerramento(
  exercicioId: string,
  userId: string,
  nomeProximoExercicio: string,
  dataInicioProximo: string | Date
) {
  return prisma.$transaction(async (tx) => {
    const exercicio = await tx.periodoContabil.findUnique({
      where: { id: exercicioId },
      include: { meses: { orderBy: { dataInicio: "asc" } } },
    });

    if (!exercicio || exercicio.bloqueado) {
      throw new Error("Exercício inválido ou já encerrado.");
    }

    if (exercicio.meses.some((m) => !m.fechado)) {
      throw new Error("Existem meses abertos neste exercício.");
    }

    // 0) validação de integridade: contas 6/7 devem estar zeradas
    const contas67 = await tx.contaContabil.findMany({
      where: {
        OR: [
          { codigo: { startsWith: "6" } },
          { codigo: { startsWith: "7" } },
        ],
        aceitaLancamento: true,
        ativa: true,
      },
    });

    if (contas67.length > 0) {
      const saldo67 = await tx.itemLancamento.groupBy({
        by: ["contaContabilId"],
        where: {
          contaContabilId: { in: contas67.map((c) => c.id) },
          lancamento: { periodo: { exercicioId }, status: "ATIVO" },
        },
        _sum: { debito: true, credito: true },
      });

      const contaNaoZerada = saldo67.find((linha) => {
        const debito = linha._sum.debito || new Prisma.Decimal(0);
        const credito = linha._sum.credito || new Prisma.Decimal(0);
        return !debito.sub(credito).isZero();
      });

      if (contaNaoZerada) {
        throw new Error("Existem contas de Gastos ou Rendimentos por liquidar.");
      }
    }

    // 1) período de apuramento (index 13)
    const periodoApuramento = await tx.periodoContabil.findFirst({
      where: { exercicioId, periodoIndex: 13 },
    });
    if (!periodoApuramento) {
      throw new Error("Período de apuramento (índice 13) não encontrado para o exercício.");
    }

    // 2) contas 88 e 81
    const contaDestino88 = await tx.contaContabil.findFirst({
      where: {
        codigo: { startsWith: "88" },
        aceitaLancamento: true,
        ativa: true,
      },
    });
    if (!contaDestino88) throw new Error("Conta 88 de movimento não encontrada.");

    const conta81Lucros = await tx.contaContabil.findFirst({
      where: {
        codigo: { startsWith: "811" },
        aceitaLancamento: true,
        ativa: true,
      },
    });
    const conta81Prejuizo = await tx.contaContabil.findFirst({
      where: {
        codigo: { startsWith: "812" },
        aceitaLancamento: true,
        ativa: true,
      },
    });
    const conta81Geral = await tx.contaContabil.findFirst({
      where: {
        codigo: { startsWith: "81" },
        aceitaLancamento: true,
        ativa: true,
      },
    });

    if (!conta81Geral) {
      throw new Error("Conta 81 de resultados transitados não encontrada.");
    }

    // 3) totais das contas 82..87 via groupBy (anti-pattern evitado)
    const contasResultado = await tx.contaContabil.findMany({
      where: {
        aceitaLancamento: true,
        ativa: true,
        OR: [
          { codigo: { startsWith: "82" } },
          { codigo: { startsWith: "83" } },
          { codigo: { startsWith: "84" } },
          { codigo: { startsWith: "85" } },
          { codigo: { startsWith: "86" } },
          { codigo: { startsWith: "87" } },
        ],
      },
    });

    const contasResultadoIds = contasResultado.map((c) => c.id);

    const saldoPorConta = await tx.itemLancamento.groupBy({
      by: ["contaContabilId"],
      where: {
        contaContabilId: { in: contasResultadoIds },
        lancamento: { periodo: { exercicioId }, status: "ATIVO" },
      },
      _sum: { debito: true, credito: true },
    });

    const zero = new Prisma.Decimal(0);
    let saldoFinal88 = new Prisma.Decimal(0);
    const itensFecho = saldoPorConta
      .map((s) => {
        const conta = contasResultado.find((c) => c.id === s.contaContabilId);
        if (!conta) return null;

        const debito = s._sum.debito || zero;
        const credito = s._sum.credito || zero;
        const saldo = debito.sub(credito);

        if (saldo.isZero()) return null;

        const valorAbs = saldo.abs();
        const item = {
          contaContabilId: conta.id,
          debito: saldo.isPositive() ? valorAbs : zero,
          credito: saldo.isNegative() ? valorAbs : zero,
          codigoConta: conta.codigo,
          nomeConta: conta.nome,
        };

        saldoFinal88 = saldoFinal88.add(saldo);
        return item;
      })
      .filter(Boolean) as { contaContabilId: string; debito: Prisma.Decimal; credito: Prisma.Decimal; codigoConta: string, nomeConta: string; }[];

    if (itensFecho.length > 0) {
      itensFecho.push({
        contaContabilId: contaDestino88.id,
        debito: saldoFinal88.isPositive() ? saldoFinal88 : zero,
        credito: saldoFinal88.isNegative() ? saldoFinal88.abs() : zero,
        codigoConta: contaDestino88.codigo,
        nomeConta: contaDestino88.nome,
      });

      await tx.lancamentoContabil.create({
        data: {
          data: exercicio.meses[11]?.dataFim ?? new Date(),
          descricao: "Encerramento de Contas de Resultado (82-87 -> 88)",
          tipo: "ENCERRAMENTO",
          status: "ATIVO",
          periodoId: periodoApuramento.id,
          criadoporId: userId,
          totalDebito: itensFecho.reduce((acc, i) => acc.add(i.debito), zero),
          totalCredito: itensFecho.reduce((acc, i) => acc.add(i.credito), zero),
          itens: { create: itensFecho },
        },
      });
    }

    // 4) Transferência 88 -> 81 (lucro / prejuízo)
    const valorFinal88 = saldoFinal88.abs();
    if (!valorFinal88.isZero()) {
      const contaDestino81 = saldoFinal88.isPositive()
        ? conta81Lucros || conta81Geral
        : conta81Prejuizo || conta81Geral;

      await tx.lancamentoContabil.create({
        data: {
          data: exercicio.meses[11]?.dataFim ?? new Date(),
          descricao:
            saldoFinal88.isPositive()
              ? "Transferência de Lucro para Resultados Transitados (88 -> 811)"
              : "Transferência de Prejuízo para Resultados Transitados (88 -> 812)",
          tipo: "ENCERRAMENTO",
          status: "ATIVO",
          periodoId: periodoApuramento.id,
          criadoporId: userId,
          totalDebito: valorFinal88,
          totalCredito: valorFinal88,
          itens: {
            create: [
              {
                contaContabilId: contaDestino88.id,
                debito: saldoFinal88.isNegative() ? valorFinal88 : zero,
                credito: saldoFinal88.isPositive() ? valorFinal88 : zero,
                codigoConta: contaDestino88.codigo,
                nomeConta: contaDestino88.nome,
              },
              {
                contaContabilId: contaDestino81.id,
                debito: saldoFinal88.isPositive() ? valorFinal88 : zero,
                credito: saldoFinal88.isNegative() ? valorFinal88 : zero,
                codigoConta: contaDestino81.codigo,
                nomeConta: contaDestino81.nome,
              },
            ],
          },
        },
      });
    }

    // 5) bloqueio do exercício
    await tx.periodoContabil.update({
      where: { id: exercicioId },
      data: { bloqueado: true, fechado: true },
    });

    // 6) validação de exercício futuro
    const inicioProximo = new Date(dataInicioProximo);
    if (isNaN(inicioProximo.getTime())) {
      throw new Error("dataInicioProximo inválida");
    }
    const fimProximo = new Date(inicioProximo.getFullYear(), 11, 31);

    const exercicioConflito = await tx.periodoContabil.findFirst({
      where: {
        OR: [
          { nome: nomeProximoExercicio },
          {
            AND: [
              { dataInicio: { lte: fimProximo } },
              { dataFim: { gte: inicioProximo } },
            ],
          },
        ],
      },
    });

    if (exercicioConflito) {
      throw new Error("Já existe exercício com mesmo nome ou datas sobrepostas.");
    }

    const proxExercicio = await tx.periodoContabil.create({
      data: {
        nome: nomeProximoExercicio,
        tipo: "EXERCICIO",
        dataInicio: inicioProximo,
        dataFim: fimProximo,
        fechado: false,
        bloqueado: false,
        criadoporId: userId,
        exercicioId: null,
        periodoIndex: 16,
      },
    });

    await criarPeriodosFiscais(tx, proxExercicio, userId);

    const periodoAberturaProx = await tx.periodoContabil.findFirst({
      where: { exercicioId: proxExercicio.id, periodoIndex: 0 },
    });
    if (!periodoAberturaProx) {
      throw new Error("Período de abertura do próximo exercício não encontrado.");
    }

    // 7) transporte de saldos de contas de balanço ao novo período 0
    const contasBalanco = await tx.contaContabil.findMany({
      where: {
        aceitaLancamento: true,
        ativa: true,
        OR: [
          { codigo: { startsWith: "1" } },
          { codigo: { startsWith: "2" } },
          { codigo: { startsWith: "3" } },
        ],
      },
    });

    const saldoBalanco = await tx.itemLancamento.groupBy({
      by: ["contaContabilId"],
      where: {
        contaContabilId: { in: contasBalanco.map((c) => c.id) },
        lancamento: { periodo: { exercicioId }, status: "ATIVO" },
      },
      _sum: { debito: true, credito: true },
    });

    const itensAbertura = saldoBalanco
      .map((s) => {
        const conta = contasBalanco.find((c) => c.id === s.contaContabilId);
        if (!conta) return null;

        const debito = s._sum.debito || zero;
        const credito = s._sum.credito || zero;
        const saldo = debito.sub(credito);
        if (saldo.isZero()) return null;

        return {
          contaContabilId: conta.id,
          debito: saldo.isPositive() ? saldo : zero,
          credito: saldo.isNegative() ? saldo.abs() : zero,
        };
      })
      .filter(Boolean) as { contaContabilId: string; debito: Prisma.Decimal; credito: Prisma.Decimal; nomeConta: string; codigoConta: string }[];

    if (itensAbertura.length > 0) {
      await tx.lancamentoContabil.create({
        data: {
          data: inicioProximo,
          descricao: "Lançamento de abertura - transporte de saldos de balanço",
          tipo: "ABERTURA",
          status: "ATIVO",
          periodoId: periodoAberturaProx.id,
          criadoporId: userId,
          totalDebito: itensAbertura.reduce((acc, i) => acc.add(i.debito), zero),
          totalCredito: itensAbertura.reduce((acc, i) => acc.add(i.credito), zero),
          itens: { create: itensAbertura },
        },
      });
    }

    return { novoExercicioId: proxExercicio.id };
  });
}