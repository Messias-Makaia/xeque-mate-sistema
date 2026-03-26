import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
    }

    const id = session?.user.id;
    const usuario = await prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        email: true,
        nome: true,
        ativo: true,
        criadoEm: true,
        criadoPor: true,
        criador: {
          select: {
            nome: true,
            email: true,
          },
        },
        usuariosCriados: {
          select: {
            id: true,
            nome: true,
            email: true,
            ativo: true,
          },
        },
        roles: {
          select: {
            id: true,
            role: {
              select: {
                id: true,
                nome: true,
                ativo: true,
              }
            },
          },
        },
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { message: "Não encontramos o seu perfil" },
        { status: 404 }
      );
    }

    return NextResponse.json(usuario, { status: 201 });
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return NextResponse.json(
      { message: "Erro ao buscar usuário" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Não autenticado", { status: 401 });

    const { novaSenha, senha } = await req.json();
    if (!novaSenha.trim() || !senha.trim()) return NextResponse.json({ message: "Forneça a senha actual e a nova" }, { status: 400 });

    if (novaSenha.trim().length < 6) return NextResponse.json({ message: "Nova senha muito curta, deve ter pelo menos 6 caracteres" }, { status: 400 });

    const verificar = await prisma.user.findUnique({ where: { id: session.user.id } });

    if (!verificar) return NextResponse.json({ message: "Não encontramos seu perfil" }, { status: 404 });
    const senhaValida = await bcrypt.compare(
      senha,
      verificar.senha,
    );
   
    if (!senhaValida) {
      return NextResponse.json({ message: "Senha actual errada" }, { status: 400 });
    }

    const hashedSenha = await bcrypt.hash(novaSenha, 10);

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        senha: hashedSenha,
        atualizadopor: session.user.id,
      }
    });

    return NextResponse.json(user, { status: 200 });
  } catch (erro: any) {
    console.log("Ocorreu um erro: ", erro);
    return NextResponse.json({ message: "Eroo ao alterar senha" }, { status: 500 });
  }
}