import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/db";
import { Decimal } from "@prisma/client/runtime/library";

export const dynamic = "force-dynamic";

// Relatório Balancete de Verificação
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dataFim = searchParams.get("dataFim");

    if (!dataFim) {
      return NextResponse.json(
        { message: "Data final é obrigatória" },
        { status: 400 }
      );
    }

    // Buscar todas as contas ativas
    const contas = await prisma.contaContabil.findMany({
      where: { ativa: true },
      orderBy: { codigo: "asc" },
    });

    // Buscar todos os itens de lançamentos até a data
    const itens = await prisma.itemLancamento.findMany({
      where: {
        lancamento: {
          status: "ATIVO",
          data: {
            lte: new Date(dataFim + "T23:59:59"),
          },
        },
      },
      include: {
        lancamento: true,
      },
    });

    // Calcular saldos por conta
    const saldosPorConta = new Map<string, { debito: Decimal; credito: Decimal }>();

    itens.forEach((item: any) => {
      const key = item.contaContabilId;
      const atual = saldosPorConta.get(key) || { debito: new Decimal(0), credito: new Decimal(0) };
      saldosPorConta.set(key, {
        debito: atual.debito.plus(item.debito),
        credito: atual.credito.plus(item.credito),
      });
    });

    // Montar balancete
    const balancete = contas
      .map((conta: any) => {
        const saldos = saldosPorConta.get(conta.id) || { debito: new Decimal(0), credito: new Decimal(0) };
        const totalDebito = saldos.debito;
        const totalCredito = saldos.credito;

        // Calcular saldo final baseado na natureza da conta
        let saldoDevedor = new Decimal(0);
        let saldoCredor = new Decimal(0);

        if (totalDebito.greaterThan(totalCredito)) {
          saldoDevedor = totalDebito.minus(totalCredito);
        } else if (totalCredito.greaterThan(totalDebito)) {
          saldoCredor = totalCredito.minus(totalDebito);
        }

        return {
          codigo: conta.codigo,
          nome: conta.nome,
          tipo: conta.tipo,
          natureza: conta.natureza,
          debito: totalDebito.toString(),
          credito: totalCredito.toString(),
          saldoDevedor: saldoDevedor.toString(),
          saldoCredor: saldoCredor.toString(),
        };
      })
      .filter(
        (item:any) =>
          parseFloat(item.debito) > 0 ||
          parseFloat(item.credito) > 0 ||
          parseFloat(item.saldoDevedor) > 0 ||
          parseFloat(item.saldoCredor) > 0
      );

    // Calcular totais
    const totais = balancete.reduce(
      (acc: any, item: any) => ({
        debito: acc.debito + parseFloat(item.debito),
        credito: acc.credito + parseFloat(item.credito),
        saldoDevedor: acc.saldoDevedor + parseFloat(item.saldoDevedor),
        saldoCredor: acc.saldoCredor + parseFloat(item.saldoCredor),
      }),
      { debito: 0, credito: 0, saldoDevedor: 0, saldoCredor: 0 }
    );

    return NextResponse.json({
      data: dataFim,
      total: balancete.length,
      contas: balancete,
      totais: {
        debito: totais.debito.toFixed(2),
        credito: totais.credito.toFixed(2),
        saldoDevedor: totais.saldoDevedor.toFixed(2),
        saldoCredor: totais.saldoCredor.toFixed(2),
      },
    });
  } catch (error) {
    console.error("Erro ao gerar balancete:", error);
    return NextResponse.json(
      { message: "Erro ao gerar balancete" },
      { status: 500 }
    );
  }
}
