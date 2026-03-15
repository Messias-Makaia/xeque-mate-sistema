import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

// Listar todas as contas
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get("tipo");
    const apenasAtivas = searchParams.get("ativas") === "true";

    const where: any = {};
    if (tipo) where.tipo = tipo;
    if (apenasAtivas) where.ativa = true;

    const contas = await prisma.contaContabil.findMany({
      where,
      orderBy: [
        { codigo: "asc" },
      ],
    });

    return NextResponse.json(contas);
  } catch (error) {
    console.error("Erro ao buscar contas:", error);
    return NextResponse.json(
      { message: "Erro ao buscar contas" },
      { status: 500 }
    );
  }
}

// Criar nova conta
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { codigo, nome, descricao, tipo, natureza, nivel, contaPai, aceitaLancamento } = body;

    if (!codigo || !nome || !tipo || !natureza || nivel === undefined) {
      return NextResponse.json(
        { message: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    // Verificar se conta já existe
    const contaExistente = await prisma.contaContabil.findUnique({
      where: { codigo },
    });

    if (contaExistente) {
      return NextResponse.json(
        { message: "Já existe uma conta com este código" },
        { status: 400 }
      );
    }

    const novaConta = await prisma.contaContabil.create({
      data: {
        codigo,
        nome,
        descricao: descricao || null,
        tipo,
        natureza,
        nivel,
        contaPai: contaPai || null,
        aceitaLancamento: aceitaLancamento ?? true,
        ativa: true,
      },
    });

    return NextResponse.json(novaConta, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar conta:", error);
    return NextResponse.json(
      { message: "Erro ao criar conta" },
      { status: 500 }
    );
  }
}
