import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { fecharPeriodo } from "../../Services/fechoPeriodo";
import prisma from "@/lib/db";


// Fechar período
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
    }
    if (!session?.user?.permissions.includes("periodos.fechar")) {
      return NextResponse.json({ message: "Permissão negada" }, { status: 403 });
    }
    const { id } = params;
    
    const periodoExistente = await prisma.periodoContabil.findUnique({
      where: { id }
    });

    if (!periodoExistente) {
      return NextResponse.json(
        { message: "Período não encontrado." },
        { status: 404 }
      );
    }

    const periodo = await fecharPeriodo(periodoExistente, session.user.id);
    return NextResponse.json({ periodo }, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao atualizar período:", error.message);
    return NextResponse.json(
      { message: error .message|| "Erro ao atualizar período." },
      { status: 500 }
    );
  }
}
