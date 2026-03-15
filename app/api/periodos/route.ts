import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  // Validação de permissão para VER
  if (!session?.user?.permissions.includes("periodos.ver")) {
    return new NextResponse("Acesso negado: permissão 'periodos.ver' necessária.", { status: 403 });
  }

  const periodos = await prisma.periodoContabil.findMany({
    include: {
      criadopor: { select: { nome: true } },
      exercicio: true,
      _count: { select: { lancamentos: true } }
    },
    orderBy: { dataInicio: 'desc' }
  });

  return NextResponse.json(periodos);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  // Validação de permissão para CRIAR
  if (!session?.user?.permissions.includes("periodos.criar")) {
    return new NextResponse("Acesso negado: permissão 'periodos.criar' necessária.", { status: 403 });
  }

  const data = await req.json();
  
  const novoPeriodo = await prisma.periodoContabil.create({
    data: {
      nome: data.nome,
      tipo: data.tipo, // "MES" ou "EXERCICIO"
      dataInicio: new Date(data.dataInicio),
      dataFim: new Date(data.dataFim),
      exercicioId: data.exercicioId || null,
      criadoporId: session.user.id,
    }
  });

  return NextResponse.json(novoPeriodo);
}