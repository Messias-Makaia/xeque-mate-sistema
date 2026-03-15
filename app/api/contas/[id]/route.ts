import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

// Atualizar conta
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { nome, descricao, aceitaLancamento, ativa } = body;

    const contaAtualizada = await prisma.contaContabil.update({
      where: { id: params.id },
      data: {
        ...(nome && { nome }),
        ...(descricao !== undefined && { descricao }),
        ...(aceitaLancamento !== undefined && { aceitaLancamento }),
        ...(ativa !== undefined && { ativa }),
      },
    });

    return NextResponse.json(contaAtualizada);
  } catch (error) {
    console.error("Erro ao atualizar conta:", error);
    return NextResponse.json(
      { message: "Erro ao atualizar conta" },
      { status: 500 }
    );
  }
}

// Deletar conta (apenas desativar)
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
    }

    // Verificar se tem lançamentos
    const temLancamentos = await prisma.itemLancamento.count({
      where: { contaContabilId: params.id },
    });

    if (temLancamentos > 0) {
      return NextResponse.json(
        { message: "Não é possível excluir conta com lançamentos" },
        { status: 400 }
      );
    }

    // Desativar conta
    const contaDesativada = await prisma.contaContabil.update({
      where: { id: params.id },
      data: { ativa: false },
    });

    return NextResponse.json(contaDesativada);
  } catch (error) {
    console.error("Erro ao deletar conta:", error);
    return NextResponse.json(
      { message: "Erro ao deletar conta" },
      { status: 500 }
    );
  }
}
