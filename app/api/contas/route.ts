import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/db";
import { authOptions } from "@/lib/auth-options";
import { criarConta } from "./service";

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
    const conta = await criarConta(body, session.user.id);
    return NextResponse.json(conta, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar conta:", error);
    const message =
      typeof error?.message === "string"
        ? error.message
        : "Erro ao criar conta";
    return NextResponse.json({ message }, { status: 400 });
  }
}
