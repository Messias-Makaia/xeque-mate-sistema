import { renderToStream } from '@react-pdf/renderer';
import { RazaoPDF } from './../../components/razaopdf';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/db";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
    }
const conta = searchParams.get("contaId");
const dataInicio = searchParams.get("dataInicio");
const dataFim = searchParams.get("dataFim");
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
  // 1. Buscar os dados REAIS no banco de dados aqui usando Prisma
  // Ignoramos o que vem do frontend por segurança
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

  if(item.contaContabil.tipo==="PASSIVO"||item.contaContabil.tipo==="RECEITA"||item.contaContabil.tipo=="CAPITAL")
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
   const dados= {
      nomeConta:itens[0]?.nomeConta || "",
      codigoConta:itens[0]?.codigoConta || "",
      razao1:razao,
      emitidopor: session?.user?.name,
      email: session?.user?.email,
    };
  // 2. Gerar o stream do PDF
  const stream = await renderToStream(<RazaoPDF dados={dados} params={Object.fromEntries(searchParams)}/>);

  // 3. Retornar o arquivo com os headers corretos
  return new NextResponse(stream as any, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Razao_${dados.codigoConta}-${dados.nomeConta}_${new Date().toLocaleDateString('pt-BR')}.pdf"`,
    },
  });
}