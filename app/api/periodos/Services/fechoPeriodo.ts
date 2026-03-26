import { StatusPeriodo } from "@prisma/client";
import prisma from "@/lib/db";

export async function fecharPeriodo(periodo: any, userId: string) {
  if (periodo.bloqueado) {
    throw new Error("O período está bloqueado e não pode ser fechado.");
  }

  if (periodo.periodoIndex === 0) {
    prisma.$transaction(async (tx) => {
      const periodoAtualizado = await prisma.periodoContabil.update({
        where: { id: periodo.id },
        data: {
          atualizadoporId: userId,
          status: StatusPeriodo.FECHADO,
        }
      });

      const periodoPosterior = await tx.periodoContabil.findFirst({
        where: {
          exercicioId: periodo.exercicioId,
          periodoIndex: periodo.periodoIndex + 1
        },
        orderBy: { dataInicio: "desc" },
      });

      if (periodoPosterior) {
        await tx.periodoContabil.update({
          where: { id: periodoPosterior.id },
          data: {
            atualizadoporId: userId,
            status: StatusPeriodo.ABERTO,
          }
        });
      }
      return periodoAtualizado;
    });
  } else {
    const periodoAnterior = await prisma.periodoContabil.findFirst({
      where: {
        exercicioId: periodo.exercicioId,
        periodoIndex: periodo.periodoIndex - 1
      },
      orderBy: { dataInicio: "desc" },
    });

    if (periodoAnterior?.status !== StatusPeriodo.FECHADO) {
      throw new Error((`O período (${periodoAnterior?.nome}) precisa ser fechado primeiro.`));
    }

    prisma.$transaction(async (tx) => {
      const periodoAtualizado = await tx.periodoContabil.update({
        where: { id: periodo.id },
        data: {
          atualizadoporId: userId,
          status: StatusPeriodo.FECHADO,
        }
      })
      const periodoPosterior = await tx.periodoContabil.findFirst({
        where: {
          exercicioId: periodo.exercicioId,
          periodoIndex: periodo.periodoIndex + 1
        },
        orderBy: { dataInicio: "desc" },
      });
      if (periodoPosterior) {
        await tx.periodoContabil.update({
          where: { id: periodoPosterior.id },
          data: {
            atualizadoporId: userId,
            status: StatusPeriodo.ABERTO,
          }
        });
      }
      return periodoAtualizado;
    });
  }
}