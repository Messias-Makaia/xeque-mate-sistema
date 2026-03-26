import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/db";
import { criarPeriodosFiscais } from "./Services/criarExercicio";
export const dynamic = "force-dynamic";


export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
    }

    if (!session?.user?.permissions.includes("periodos.ver")) {
      return NextResponse.json({ message: "Permissão negada" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get("tipo");

    const contagem = await prisma.exercicioFiscal.count();

    const periodos = await prisma.exercicioFiscal.findMany({
      include:{
        periodos:true,
      }
    });

    return NextResponse.json({ exercicios: periodos, podeCriar: contagem === 0 }, { status: 200 });
  } catch (error) {
    console.log("Erro ao buscar períodos:", error);
    return NextResponse.json(
      { message: "Erro ao buscar períodos" },
      { status: 500 }
    );
  }
}

// Criar novo exercicio
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
    }
    if (!session?.user?.permissions.includes("exercicios.criar")) {
      return NextResponse.json({ message: "Permissão negada" }, { status: 403 });
    }

    const verficarExercicios = await prisma.exercicioFiscal.count();

    if (verficarExercicios >= 1) {
      return NextResponse.json(
        { message: "Já existe um exercício criado." },
        { status: 400 }
      );
    }

    const body = await req.json();
    if(!body)
    {
       return NextResponse.json(
        { message: "Dados inválidos." },
        { status: 400 }
      );
    }
    
    const {nome, dataInicio} = body;
    if (!nome || !dataInicio) {
      return NextResponse.json(
        { message: "Nome e data de início são obrigatórios." },
        { status: 400 }
      );
    }
    
    const nomeRegex = /^[A-za-z0-9]{6,30}$/;
    if (!nomeRegex.test(nome.trim())) {
      return NextResponse.json(
        { message: "Nome inválido. O nome deve ter entre 6 a 30 caracteres alfanuméricos sem espaços." },
        { status: 400 }
      );
    }
    const exercicio = { nome: nome.trim(), dataInicio: new Date(dataInicio),};
    const periodo = await prisma.$transaction(async (tx) => {
      const periodo = await criarPeriodosFiscais(tx, exercicio, session?.user?.id);
      return periodo;
    })
    return NextResponse.json(periodo, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar período:", error);
    return NextResponse.json(
      { message: "Erro ao criar período." },
      { status: 500 }
    );
  }
}