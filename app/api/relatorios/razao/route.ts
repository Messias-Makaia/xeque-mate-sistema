import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

// Relatório Razão
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dataInicio = searchParams.get("dataInicio");
    const dataFim = searchParams.get("dataFim");
    const conta = searchParams.get("contaId");
    
    if (!dataInicio || !dataFim) {
      return NextResponse.json(
        { message: "Parâmetros de data são obrigatórios" },
        { status: 400 }
      );
    }

     if (!conta) {
      return NextResponse.json(
        { message: "A conta deve ser informada" },
        { status: 400 }
      );
    }
    
    const itens = await prisma.itemLancamento.findMany({
  where: {
    contaContabilId: conta,
    lancamento:{ 
      status: "ATIVO",
      data: {
          gte: new Date(dataInicio),
          lte: new Date(dataFim + "T23:59:59"),
        },
    },
  },
  include: {
    lancamento:true,
    contaContabil:true,
  },
  orderBy: {
    lancamento: {
      data: "asc"
    }
  }
});

let saldo = 0;

const razao = itens.map((item:any) => {
  const debito = parseFloat(item.debito);
  const credito = parseFloat(item.credito);

  if(item.contaContabil.tipo==="PASSIVO"||item.contaContabil.tipo==="RECEITA"|| item.contaContabil.tipo==="CAPITAL")
  saldo += credito-debito;
  else
  saldo += debito-credito;

  return {
    data: item.lancamento.data,
    documento: item.lancamento.documento,
    descricao: item.lancamento.descricao,
    debito,
    credito,
    saldo
  };
});
    return NextResponse.json({
      periodo: { dataInicio, dataFim },
      nomeConta:itens[0]?.nomeConta || "",
      codigoConta:itens[0]?.codigoConta || "",
      razao1:razao,
      emitidopor: session?.user?.name,
      email: session?.user?.email,
    });
  } catch (error) {
    console.error("Erro ao gerar razão:", error);
    return NextResponse.json(
      { message: "Erro ao gerar razão" },
      { status: 500 }
    );
  }
}
