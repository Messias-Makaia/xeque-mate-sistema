import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const toContaGrupo = (tipo: string | null | undefined) => {
  if (!tipo) return null;
  const t = tipo.toString().toUpperCase();
  if (["ATIVO", "PASSIVO", "PATRIMONIAL", "CAPITAL"].includes(t)) return "balanco";
  if (["RECEITA", "DESPESA", "RESULTADO"].includes(t)) return "resultado";
  return null;
};

const isAccountTypeAllowedInFiscalPeriod = (periodIndex: number, contaGrupo: "balanco" | "resultado") => {
  if (periodIndex === 0) return contaGrupo === "balanco";
  if (periodIndex >= 1 && periodIndex <= 12) return true;
  if (periodIndex === 13) return contaGrupo === "resultado";
  if (periodIndex === 14 || periodIndex === 15) return contaGrupo === "balanco" || contaGrupo === "resultado";
  return false;
};

const extrairClasseConta = (codigoConta: string): number | null => {
  if (!codigoConta || typeof codigoConta !== "string") return null;
  const digito = codigoConta.trim().split(/[\.\-\/ ]/)[0]?.substring(0, 1);
  const n = Number(digito);
  if (!Number.isInteger(n) || n < 1 || n > 9) return null;
  return n;
};

export function validaContaParaPeriodo(
  periodoIndex: number,
  codigoConta: string,
  isSystemGenerated: boolean = false
): string | null {
  const classe = extrairClasseConta(codigoConta);
  if (classe === null) return "Código de conta inválido. Use formato ex: 1.01.01";

  if (periodoIndex === 0) {
    if (classe >= 1 && classe <= 5) return null;
    return "Período 0 (abertura) permite apenas contas de classe 1-5. Contas de resultado (6/7) e apuração (8) devem iniciar o exercício com saldo zero e não aceitam lançamentos de abertura.";
  }

  if (periodoIndex >= 1 && periodoIndex <= 12) {
    if (classe >= 1 && classe <= 7) return null;
    return "Períodos 1 a 12 aceitam classes 1-7. Classe 8 (apuração) não é lançável diretamente.";
  }

  if (periodoIndex === 13) {
    if (classe >= 1 && classe <= 7) return null;
    return "Período 13 (ajustes) aceita classes 1-7; classe 8 (apuração) deve ser mantida para processos de fechamento.";
  }

  if (periodoIndex === 14) {
    if (!isSystemGenerated) {
      return "Período 14 (zeramento/apuração) é exclusivo para lançamentos de sistema. Lançamentos manuais não são permitidos.";
    }
    if (classe === 6 || classe === 7 || classe === 8) return null;
    return "Período 14 aceita somente classes 6,7 e 8 (receita, despesa, apuração). Contas 1-5 não são válidas.";
  }

  if (periodoIndex === 15) {
    if (!isSystemGenerated) {
      return "Período 15 (destinação/balanço) é exclusivo para lançamentos de sistema. Lançamentos manuais não são permitidos.";
    }
    if (classe === 8 || classe === 2) return null;
    if (classe === 6 || classe === 7) {
      return "Período 15 não permite contas de receita (6) ou despesa (7); devem estar zeradas.";
    }
    return "Período 15 aceita apenas classe 8 (apuração/resultado) e classe 2 (patrimônio líquido).";
  }

  return "Período inválido. Use índice de 0 a 15.";
}

export async function validateLancamentoPayload(payload: any) {
  const { periodoId, data, itens, exercicioId } = payload;

  if (!periodoId || !data || !Array.isArray(itens) || itens.length === 0) {
    throw { status: 400, message: "periodoContabilId, data e itens são obrigatórios" };
  }

  const periodo = await prisma.periodoContabil.findUnique({ where: { id: periodoId }, include: { exercicio: true } });
  if (!periodo) throw { status: 400, message: "Período contábil não encontrado" };
  if (periodo.status === "FECHADO") throw { status: 403, message: "Não é possível operar em período fechado" };
  if (periodo.status === "AGUARDANDO") throw { status: 403, message: "Não é possível operar em um período não aberto ainda" };
  if (periodo.exercicio.fechado) throw { status: 403, message: "Não é possível operar em um exercício fechado" };

  const dataLancamento = format(new Date(data), "dd/MM/yyyy", { locale: ptBR });
  const dataI = format (new Date(periodo.dataInicio), "dd/MM/yyyy", { locale: ptBR } );
  const dataF = format (new Date(periodo.dataFim), "dd/MM/yyyy", { locale: ptBR } );
  if (dataLancamento < dataI|| dataLancamento > dataF) {
    throw {
      status: 400,
      message: `${dataLancamento} ${periodo.dataInicio}Data do lançamento deve estar dentro do intervalo do período`,
    };
  }

  // Consistência de exercício
  if (!periodo.exercicioId) {
    throw { status: 400, message: "Período de exercício inválido" };
  }

  let totalDebito = new Prisma.Decimal(0);
  let totalCredito = new Prisma.Decimal(0);
  let temDebito = false;
  let temCredito = false;

  for (const item of itens) {
    const debito = new Prisma.Decimal(item.debito ?? 0);
    const credito = new Prisma.Decimal(item.credito ?? 0);
    if (debito.lessThan(0) || credito.lessThan(0)) {
      throw { status: 400, message: "Débito e crédito não podem ser negativos" };
    }
    if (debito.equals(0) && credito.equals(0)) {
      throw { status: 400, message: "Cada item deve ter um valor de débito ou crédito maior que zero" };
    }
    if (debito.greaterThan(0) && credito.greaterThan(0)) {
      throw { status: 400, message: "Cada item deve ser apenas débito ou crédito, não ambos" };
    }
    temDebito ||= debito.greaterThan(0);
    temCredito ||= credito.greaterThan(0);

    const conta = await prisma.contaContabil.findUnique({ where: { id: item.contaContabilId } });
    if (!conta) throw { status: 400, message: `Conta ${item.contaContabilId} não encontrada` };
    if (!conta.aceitaLancamento) {
      throw { status: 400, message: `A conta ${conta.codigo} não aceita lançamentos` };
    }
    if (exercicioId !== periodo.exercicioId) {
      throw { status: 400, message: `O ${periodo.nome} em que está lançar pertence a um exercício diferente` };
    }

    const msg = validaContaParaPeriodo(periodo.periodoIndex, conta.codigo, payload.isSystemGenerated ?? false);
    if (msg) throw { status: 400, message: msg };

    const contaGrupo = toContaGrupo(conta.tipo);
    if (!contaGrupo) {
      throw { status: 400, message: `Tipo de conta ${conta.tipo} não é reconhecido` };
    }
    if (!isAccountTypeAllowedInFiscalPeriod(periodo.periodoIndex ?? periodo.periodoIndex ?? 0, contaGrupo)) {
      const nomePeriodo = periodo.periodoIndex === 0 ? "Abertura" :
        periodo.periodoIndex === 13 ? "Apuramento" : `Mês ${periodo.periodoIndex}`;
      throw {
        status: 400,
        message: `O período ${nomePeriodo} não aceita contas do tipo ${contaGrupo}`,
      };
    }
    
    totalDebito = totalDebito.add(debito);
    totalCredito = totalCredito.add(credito);
  }
  if (!temDebito || !temCredito) {
    throw { status: 400, message: "O lançamento deve conter pelo menos um item de débito e um item de crédito" };
  }

  if (!totalDebito.equals(totalCredito)) {
    throw { status: 400, message: "Total de débito deve ser igual ao total de crédito" };
  }
  return { periodo, totalDebito, totalCredito };
}