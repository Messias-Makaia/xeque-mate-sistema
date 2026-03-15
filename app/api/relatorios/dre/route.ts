import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/db";
import { Decimal } from "@prisma/client/runtime/library";

export const dynamic = "force-dynamic";

// Demonstração do Resultado do Exercício (DRE)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dataInicio = searchParams.get("dataInicio");
    const dataFim = searchParams.get("dataFim");

    if (!dataInicio || !dataFim) {
      return NextResponse.json(
        { message: "Parâmetros de data são obrigatórios" },
        { status: 400 }
      );
    }

    // Buscar itens de lançamentos no período
    const itens = await prisma.itemLancamento.findMany({
      where: {
        lancamento: {
          status: "ATIVO",
          data: {
            gte: new Date(dataInicio),
            lte: new Date(dataFim + "T23:59:59"),
          },
        },
      },
      include: {
        contaContabil: true,
        lancamento: true,
      },
    });

    // Separar receitas e custos
    let totalReceitas = new Decimal(0);
    let totalCustos = new Decimal(0);

    const receitas: any[] = [];
    const custos: any[] = [];

    const receitasPorConta = new Map<string, Decimal>();
    const custosPorConta = new Map<string, Decimal>();

    itens.forEach((item: any) => {
      const conta = item.contaContabil;
      
      if (conta.tipo === "RECEITA") {
        // Receitas são creditadas (aumentam no crédito)
        const atual = receitasPorConta.get(conta.id) || new Decimal(0);
        receitasPorConta.set(conta.id, atual.plus(item.credito).minus(item.debito));
      } else if (conta.tipo === "CUSTO") {
        // Custos são debitados (aumentam no débito)
        const atual = custosPorConta.get(conta.id) || new Decimal(0);
        custosPorConta.set(conta.id, atual.plus(item.debito).minus(item.credito));
      }
    });

    // Montar receitas
    for (const [contaId, valor] of receitasPorConta.entries()) {
      if (valor.greaterThan(0)) {
        const conta = await prisma.contaContabil.findUnique({ where: { id: contaId } });
        if (conta) {
          receitas.push({
            codigo: conta.codigo,
            nome: conta.nome,
            valor: valor.toString(),
          });
          totalReceitas = totalReceitas.plus(valor);
        }
      }
    }

    // Montar custos
    for (const [contaId, valor] of custosPorConta.entries()) {
      if (valor.greaterThan(0)) {
        const conta = await prisma.contaContabil.findUnique({ where: { id: contaId } });
        if (conta) {
          custos.push({
            codigo: conta.codigo,
            nome: conta.nome,
            valor: valor.toString(),
          });
          totalCustos = totalCustos.plus(valor);
        }
      }
    }

    const resultadoLiquido = totalReceitas.minus(totalCustos);

    return NextResponse.json({
      periodo: { dataInicio, dataFim },
      receitas: {
        itens: receitas.sort((a, b) => a.codigo.localeCompare(b.codigo)),
        total: totalReceitas.toString(),
      },
      custos: {
        itens: custos.sort((a, b) => a.codigo.localeCompare(b.codigo)),
        total: totalCustos.toString(),
      },
      resultadoLiquido: resultadoLiquido.toString(),
      tipo: resultadoLiquido.greaterThanOrEqualTo(0) ? "LUCRO" : "PREJUIZO",
    });
  } catch (error) {
    console.error("Erro ao gerar DRE:", error);
    return NextResponse.json(
      { message: "Erro ao gerar DRE" },
      { status: 500 }
    );
  }
}
