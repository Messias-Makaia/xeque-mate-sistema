import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

// Buscar usuário específico
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
    }

    const usuario = await prisma.user.findUnique({
      where: { id: params.id },
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
        roles:{
          select:{
            id:true,
            role:{
              select:{
                id:true,
                nome:true,
                ativo:true,
              }
            },
          },
        },
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { message: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(usuario);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return NextResponse.json(
      { message: "Erro ao buscar usuário" },
      { status: 500 }
    );
  }
}

// Editar usuário
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { email, senha, nome, ativo, roles} = body;

    // Verificar se o usuário existe
    const usuarioExistente = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!usuarioExistente) {
      return NextResponse.json(
        { message: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o novo email já existe em outro usuário
    if (email && email !== usuarioExistente.email) {
      const emailEmUso = await prisma.user.findUnique({
        where: { email },
      });

      if (emailEmUso) {
        return NextResponse.json(
          { message: "Este email já está em uso por outro usuário" },
          { status: 400 }
        );
      }
    }

    // Preparar dados para atualização
    const dadosAtualizacao: any = {
      email: email || usuarioExistente.email,
      nome: nome || usuarioExistente.nome,
    };

    // Se ativo foi fornecido, atualizar
    if (ativo !== undefined) {
      dadosAtualizacao.ativo = ativo;
    }

    // Se senha foi fornecida, fazer hash e atualizar
    if (senha) {
      const senhaHash = await bcrypt.hash(senha, 10);
      dadosAtualizacao.senha = senhaHash;
    }

    if(!roles){
      return NextResponse.json({message:"Nenhum papel selecionado"}, {status: 400});
    } 

    // Atualizar usuário
    const usuarioAtualizado = await prisma.$transaction( async (tx) => {
     const user = await tx.user.update({
      where: { id: params.id },
      data:{
        email: dadosAtualizacao.email, 
        nome: dadosAtualizacao.nome,
        ativo: dadosAtualizacao.ativo!== undefined ? dadosAtualizacao.ativo : usuarioExistente.ativo,
        atualizadopor: session.user.id,
        senha: dadosAtualizacao?.senha !== undefined ? dadosAtualizacao.senha:usuarioExistente.senha, 
      },})

      await tx.userRole.deleteMany({
        where:{userId: usuarioExistente.id}
      })

      const novosRoles = roles.map((r:any) =>(
        {
          userId: user.id,
          roleId: r.id,
        }
      ));

      await tx.userRole.createMany({
        data:novosRoles,
      })

      return user;
    });

    return NextResponse.json(usuarioAtualizado, {status:200});
  } catch (error) {
    console.error("Erro ao editar usuário:", error);
    return NextResponse.json(
      { message: "Erro ao editar usuário" },
      { status: 500 }
    );
  }
}

// Desativar usuário (soft delete)
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
    }

    // Não permitir desativar a si mesmo
    if (session.user.id === params.id) {
      return NextResponse.json(
        { message: "Você não pode desativar sua própria conta" },
        { status: 400 }
      );
    }

    // Verificar se o usuário existe
    const usuario = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!usuario) {
      return NextResponse.json(
        { message: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Desativar usuário
    const usuarioDesativado = await prisma.user.update({
      where: { id: params.id },
      data: { ativo: false },
      select: {
        id: true,
        email: true,
        nome: true,
        ativo: true,
        criadoEm: true,
      },
    });

    return NextResponse.json(usuarioDesativado);
  } catch (error) {
    console.error("Erro ao desativar usuário:", error);
    return NextResponse.json(
      { message: "Erro ao desativar usuário" },
      { status: 500 }
    );
  }
}
