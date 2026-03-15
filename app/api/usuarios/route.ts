import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.permissions.includes("utilizadores.ver")) {
    return new NextResponse("Não autorizado", { status: 403 });
  }

  const users = await prisma.user.findMany({
    include: {
      roles: { include: { role: true } }
    },
    orderBy: { nome: 'asc' }
  });

  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.permissions.includes("utilizadores.criar")) {
    return new NextResponse("Não autorizado", { status: 403 });
  }

  const { nome, email, senha, roleId } = await req.json();
  const hashedSenha = await bcrypt.hash(senha, 10);

  const user = await prisma.user.create({
    data: {
      nome,
      email,
      senha: hashedSenha,
      roles: {
        create: { roleId }
      }
    }
  });

  return NextResponse.json(user);
}