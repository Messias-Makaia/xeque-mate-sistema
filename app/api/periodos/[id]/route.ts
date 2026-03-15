import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.permissions.includes("periodos.fechar")) {
    return new NextResponse("Acesso negado: permissão 'periodos.fechar' necessária.", { status: 403 });
  }

  const periodo = await prisma.periodoContabil.update({
    where: { id: params.id },
    data: { 
      fechado: true,
      atualizadoporId: session.user.id 
    }
  });

  return NextResponse.json(periodo);
}