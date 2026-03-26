import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/db";
import { Decimal } from "@prisma/client/runtime/library";

export const dynamic = "force-dynamic";

// Balanço Patrimonial
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dataFim = searchParams.get("dataFim");

    if (!dataFim?.trim()) {
      return NextResponse.json(
        { message: "Data final é obrigatória" },
        { status: 400 }
      );
    }

    // Buscar contas ativas
    const contas = await prisma.contaContabil.findMany({
      where: { ativa: true },
      orderBy: { codigo: "asc" },
    });

    // Buscar itens de lançamentos até a data
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
    const saldosPorConta = new Map<string, Decimal>();

    itens.forEach((item: any) => {
      const key = item.contaContabilId;
      const saldoAtual = saldosPorConta.get(key) || new Decimal(0);
      
      // Saldo = Débitos - Créditos
      const novoSaldo = saldoAtual.plus(item.debito).minus(item.credito);
      saldosPorConta.set(key, novoSaldo);
    });

    // Separar por tipo
    let totalAtivo = new Decimal(0);
    let totalPassivo = new Decimal(0);
    let totalCapital = new Decimal(0);

    const ativos: any[] = [];
    const passivos: any[] = [];
    const capitais: any[] = [];

    contas.forEach((conta: any) => {
      const saldo = saldosPorConta.get(conta.id) || new Decimal(0);
      
      // Ajustar saldo conforme natureza
      let valorFinal = new Decimal(0);
      
      if (conta.natureza === "DEVEDORA") {
        // Contas de natureza devedora: saldo positivo quando débito > crédito
        valorFinal = saldo;
      } else {
        // Contas de natureza credora: saldo positivo quando crédito > débito
        valorFinal = saldo.negated();
      }

      // Filtrar apenas contas com saldo
      if (valorFinal.abs().greaterThan(0.01)) {
        const item = {
          codigo: conta.codigo,
          nome: conta.nome,
          valor: valorFinal.abs().toString(),
        };

        if (conta.tipo === "ATIVO") {
          ativos.push(item);
          totalAtivo = totalAtivo.plus(valorFinal.abs());
        } else if (conta.tipo === "PASSIVO") {
          passivos.push(item);
          totalPassivo = totalPassivo.plus(valorFinal.abs());
        } else if (conta.tipo === "CAPITAL") {
          capitais.push(item);
          totalCapital = totalCapital.plus(valorFinal.abs());
        }
      }
    });

    const totalPassivoCapital = totalPassivo.plus(totalCapital);

    return NextResponse.json({
      data: dataFim,
      ativo: {
        itens: ativos,
        total: totalAtivo.toString(),
      },
      passivo: {
        itens: passivos,
        total: totalPassivo.toString(),
      },
      capital: {
        itens: capitais,
        total: totalCapital.toString(),
      },
      totalPassivoCapital: totalPassivoCapital.toString(),
      equilibrio: totalAtivo.minus(totalPassivoCapital).abs().lessThan(0.01),
    });
  } catch (error) {
    console.error("Erro ao gerar balanço:", error);
    return NextResponse.json(
      { message: "Erro ao gerar balanço" },
      { status: 500 }
    );
  }
}
