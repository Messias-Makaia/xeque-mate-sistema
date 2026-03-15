import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

// Relatório Diário
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

    const lancamentos = await prisma.lancamentoContabil.findMany({
      where: {
        status: "ATIVO",
        data: {
          gte: new Date(dataInicio),
          lte: new Date(dataFim + "T23:59:59"),
        },
      },
      include: {
        itens: {
          orderBy: { debito: "desc" },
        },
      },
      orderBy: [
        { data: "asc" },
        { criadoEm: "asc" },
      ],
    });

    const diario = lancamentos.map((lanc: any) => ({
      id: lanc.id,
      data: lanc.data.toISOString(),
      descricao: lanc.descricao,
      documento: lanc.documento,
      totalDebito: lanc.totalDebito.toString(),
      totalCredito: lanc.totalCredito.toString(),
      itens: lanc.itens.map((item: any) => ({
        id: item.id,
        codigoConta: item.codigoConta,
        nomeConta: item.nomeConta,
        debito: item.debito.toString(),
        credito: item.credito.toString(),
      })),
    }));

    return NextResponse.json({
      periodo: { dataInicio, dataFim },
      total: diario.length,
      lancamentos: diario,
    });
  } catch (error) {
    console.error("Erro ao gerar diário:", error);
    return NextResponse.json(
      { message: "Erro ao gerar diário" },
      { status: 500 }
    );
  }
}
