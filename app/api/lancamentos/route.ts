import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/db";
import { validateLancamentoPayload } from "./validations";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Não autenticado" }, { status: 401 });

    const body = await req.json();
    const { periodo, totalDebito, totalCredito } = await validateLancamentoPayload(body);

    const lancamento = await prisma.$transaction( async (tx) => {


      return tx.lancamentoContabil.create({
      data: {
        data: new Date(body.data),
        descricao: body.descricao || null,
        documento: body.documento || null,
        observacoes: body.observacoes || null,
        tipo: body.tipo || "NORMAL",
        status: "ATIVO",
        criadoporId: session.user.id,
        periodoId: periodo.id,
        exercicioId:body.exercicioId,
        totalDebito,
        totalCredito,
        itens: {
          create: body.itens.map((item: any) => ({
            contaContabilId: item.contaContabilId,
            debito: parseFloat(item.debito || 0),
            credito: parseFloat(item.credito || 0),
            codigoConta: item.codigoConta,
            nomeConta: item.nomeConta,
          })),
        },
      },
      include: { itens: true },
    })});

    return NextResponse.json(lancamento, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar lançamento:", error);
    return NextResponse.json(
      { message: error?.message || "Erro ao criar lançamento" },
      { status: error?.status ?? 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
    }
     if (!session?.user?.permissions.includes("lancamentos.ver")) {
      return NextResponse.json({ message: "Permissão negada" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const dataInicio = searchParams.get("dataInicio");
    const dataFim = searchParams.get("dataFim");

    const where: any = { status: "ATIVO" };

    if (dataInicio && dataFim) {
      where.data = {
        gte: new Date(dataInicio),
        lte: new Date(dataFim),
      };
    }

    const lancamentos = await prisma.lancamentoContabil.findMany({
      where,
      include: {
        itens: {
          orderBy: { debito: "desc" },
        },
        criadopor:{
          
        },

        periodo:{

        },
      },
      orderBy: { data: "desc" },
    });

    // Converter Decimal para string para evitar erro de serialização
    const lancamentosSerializados = lancamentos.map((lanc: any) => ({
      ...lanc,
      totalDebito: lanc.totalDebito.toString(),
      totalCredito: lanc.totalCredito.toString(),
      itens: lanc.itens.map((item: any) => ({
        ...item,
        debito: item.debito.toString(),
        credito: item.credito.toString(),
      })),
    }));

    return NextResponse.json(lancamentosSerializados);
  } catch (error) {
    console.error("Erro ao buscar lançamentos:", error);
    return NextResponse.json(
      { message: "Erro ao buscar lançamentos" },
      { status: 500 }
    );
  }
}