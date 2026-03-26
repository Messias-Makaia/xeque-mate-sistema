import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

// Estornar lançamento
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
    }

    // Buscar lançamento original
    const lancamentoOriginal = await prisma.lancamentoContabil.findUnique({
      where: { id: params.id },
      include: { itens: true },
    });

    if (!lancamentoOriginal) {
      return NextResponse.json(
        { message: "Lançamento não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se já foi estornado
    if (lancamentoOriginal.status === "ESTORNADO") {
      return NextResponse.json(
        { message: "Este lançamento já foi estornado" },
        { status: 400 }
      );
    }

    // Verificar se foi cancelado
    if (lancamentoOriginal.status === "CANCELADO") {
      return NextResponse.json(
        { message: "Não é possível estornar um lançamento cancelado" },
        { status: 400 }
      );
    }

    // Criar lançamento de estorno (inverter débito e crédito)
    const itensEstorno = lancamentoOriginal.itens.map((item: any) => ({
      contaContabilId: item.contaContabilId,
      codigoConta: item.codigoConta,
      nomeConta: item.nomeConta,
      debito: parseFloat(item.credito.toString()), // Inverter
      credito: parseFloat(item.debito.toString()), // Inverter
    }));

    // Criar o lançamento de estorno
    const lancamentoEstorno = await prisma.lancamentoContabil.create({
      data: {
        data: new Date(),
        descricao: `ESTORNO - ${lancamentoOriginal.descricao}`,
        documento: lancamentoOriginal.documento,
        tipo: "ESTORNO",
        totalDebito: lancamentoOriginal.totalCredito, // Inverter
        totalCredito: lancamentoOriginal.totalDebito, // Inverter
        status: "ATIVO",
        periodoId: lancamentoOriginal.periodoId,
        observacoes: `Estorno do lançamento ${lancamentoOriginal.id}`,
        criadoporId: session?.user?.id || "",
        lancamentoOriginalId: lancamentoOriginal.id,
        itens: {
          create: itensEstorno,
        },
      },
      include: {
        itens: true,
      },
    });

    // Marcar lançamento original como estornado
    await prisma.lancamentoContabil.update({
      where: { id: params.id },
      data: { status: "ESTORNADO" },
    });

    // Serializar para retorno
    const estornoSerializado = {
      ...lancamentoEstorno,
      totalDebito: lancamentoEstorno.totalDebito.toString(),
      totalCredito: lancamentoEstorno.totalCredito.toString(),
      itens: lancamentoEstorno.itens.map((item: any) => ({
        ...item,
        debito: item.debito.toString(),
        credito: item.credito.toString(),
      })),
    };

    return NextResponse.json(estornoSerializado, { status: 201 });
  } catch (error) {
    console.error("Erro ao estornar lançamento:", error);
    return NextResponse.json(
      { message: "Erro ao estornar lançamento" },
      { status: 500 }
    );
  }
}
