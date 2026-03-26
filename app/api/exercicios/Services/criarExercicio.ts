import { Prisma, StatusPeriodo } from "@prisma/client";

const status = StatusPeriodo;
const definicoesPeriodosFiscais = (comeco: number) => [
  { index: 0, nome: "Abertura", contas: ["balanco"] },
  ...Array.from({ length: 12 }, (_, i) => ({
    index: i + 1,
    nome: new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(
      new Date(2000, comeco + i, 1)
    ),
    contas: ["balanco", "resultado"],
  })),
  { index: 13, nome: "Ajustes", contas: ["resultado"] },
  { index: 14, nome: "Apuramento", contas: ["balanco", "resultado"] },
  { index: 15, nome: "Distribuição", contas: ["resultado"] },
];

const calcularDatasPeriodos = (
  baseYear: number,
  startMonth: number,
  startDay: number,
  periodIndex: number
): { dataInicio: Date; dataFim: Date } => {
  if (periodIndex === 0) {
    const d = new Date(baseYear, startMonth, startDay);
    return { dataInicio: d, dataFim: d };
  }
  if(periodIndex>=13)
  {
    const d = new Date(baseYear, startMonth + 12, startDay-1);
    return { dataInicio: d, dataFim: d };
  }
  const start = new Date(baseYear, startMonth + periodIndex - 1, startDay);
  const end = new Date(baseYear, startMonth + periodIndex, startDay-1);
  return { dataInicio: start, dataFim: end };
};

export const criarPeriodosFiscais = async(
  tx: Prisma.TransactionClient,
  exercicio: any,
  userId: string
) => {
  const fim = new Date(exercicio.dataInicio.getFullYear(), exercicio.dataInicio.getMonth() + 12, exercicio.dataInicio.getDate() - 1); // fim é 12 meses após início
  const periodo = await tx.exercicioFiscal.create({
        data: {
          nome: exercicio.nome,
          dataInicio: exercicio.dataInicio,
          dataFim: fim,
          fechado: false,
          criadoporId: userId,
        },
      });
  const baseYear = periodo.dataInicio.getFullYear();
  const baseMonth = periodo.dataInicio.getMonth();
  const startday = periodo.dataInicio.getDate();
  const childData = definicoesPeriodosFiscais(baseMonth).map((def: any) => {
    const { dataInicio, dataFim } = calcularDatasPeriodos(
      baseYear,
      baseMonth,
      startday,
      def.index
    );
    return {
      nome: def.nome.toLocaleUpperCase(),
      periodoIndex: def.index,
      dataInicio,
      dataFim,
      status: def.index===0 ? status.ABERTO : status.AGUARDANDO,
      exercicioId: periodo.id,
    };
  });

  await tx.periodoContabil.createMany({
    data: childData,
  });

  return periodo; 
}

