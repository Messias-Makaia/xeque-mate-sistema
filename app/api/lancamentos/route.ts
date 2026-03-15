// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth-options";
// import prisma from "@/lib/db";

// export const dynamic = "force-dynamic";

// // Listar lançamentos
// export async function GET(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session) {
//       return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
//     }

//     const { searchParams } = new URL(req.url);
//     const dataInicio = searchParams.get("dataInicio");
//     const dataFim = searchParams.get("dataFim");

//     const where: any = { status: "ATIVO" };

//     if (dataInicio && dataFim) {
//       where.data = {
//         gte: new Date(dataInicio),
//         lte: new Date(dataFim),
//       };
//     }

//     const lancamentos = await prisma.lancamentoContabil.findMany({
//       where,
//       include: {
//         itens: {
//           orderBy: { debito: "desc" },
//         },
//       },
//       orderBy: { data: "desc" },
//     });

//     // Converter Decimal para string para evitar erro de serialização
//     const lancamentosSerializados = lancamentos.map((lanc: any) => ({
//       ...lanc,
//       totalDebito: lanc.totalDebito.toString(),
//       totalCredito: lanc.totalCredito.toString(),
//       itens: lanc.itens.map((item: any) => ({
//         ...item,
//         debito: item.debito.toString(),
//         credito: item.credito.toString(),
//       })),
//     }));

//     return NextResponse.json(lancamentosSerializados);
//   } catch (error) {
//     console.error("Erro ao buscar lançamentos:", error);
//     return NextResponse.json(
//       { message: "Erro ao buscar lançamentos" },
//       { status: 500 }
//     );
//   }
// }

// // Criar novo lançamento
// export async function POST(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session) {
//       return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
//     }

//     const body = await req.json();
//     const { data, descricao, documento, tipo, observacoes, itens } = body;

//     if (!data || !descricao || !itens || itens.length === 0) {
//       return NextResponse.json(
//         { message: "Campos obrigatórios faltando" },
//         { status: 400 }
//       );
//     }

//     // Validar partidas dobradas
//     let totalDebito = 0;
//     let totalCredito = 0;

//     for (const item of itens) {
//       totalDebito += parseFloat(item.debito || 0);
//       totalCredito += parseFloat(item.credito || 0);
//     }

//     if (Math.abs(totalDebito - totalCredito) > 0.01) {
//       return NextResponse.json(
//         { message: "Partidas dobradas inválidas: Débito deve ser igual ao Crédito" },
//         { status: 400 }
//       );
//     }

//     // Buscar informações das contas
//     const itensComContas = await Promise.all(
//       itens.map(async (item: any) => {
//         const conta = await prisma.contaContabil.findUnique({
//           where: { id: item.contaContabilId },
//         });

//         if (!conta) {
//           throw new Error(`Conta com ID ${item.contaContabilId} não encontrada`);
//         }

//         if (!conta.aceitaLancamento) {
//           throw new Error(`A conta ${conta.codigo} - ${conta.nome} não aceita lançamentos (conta sintética)`);
//         }

//         return {
//           contaContabilId: item.contaContabilId,
//           codigoConta: conta.codigo,
//           nomeConta: conta.nome,
//           debito: parseFloat(item.debito || 0),
//           credito: parseFloat(item.credito || 0),
//         };
//       })
//     );

//     // Criar lançamento
//     const novoLancamento = await prisma.lancamentoContabil.create({
//       data: {
//         data: new Date(data),
//         descricao,
//         documento: documento || null,
//         tipo: tipo || "NORMAL",
//         totalDebito,
//         totalCredito,
//         status: "ATIVO",
//         observacoes: observacoes || null,
//         criadoPor: session?.user?.id || "",
//         itens: {
//           create: itensComContas,
//         },
//       },
//       include: {
//         itens: true,
//       },
//     });

//     // Serializar para retorno
//     const lancamentoSerializado = {
//       ...novoLancamento,
//       totalDebito: novoLancamento.totalDebito.toString(),
//       totalCredito: novoLancamento.totalCredito.toString(),
//       itens: novoLancamento.itens.map((item: any) => ({
//         ...item,
//         debito: item.debito.toString(),
//         credito: item.credito.toString(),
//       })),
//     };

//     return NextResponse.json(lancamentoSerializado, { status: 201 });
//   } catch (error: any) {
//     console.error("Erro ao criar lançamento:", error);
//     return NextResponse.json(
//       { message: error?.message || "Erro ao criar lançamento" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

// Listar lançamentos
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dataInicio = searchParams.get("dataInicio");
    const dataFim = searchParams.get("dataFim");

    const where: any = { status: "ATIVO" };

    if (dataInicio && dataFim) {
      where.data = {
        gte: new Date(dataInicio),
        lte: new Date(dataFim),
      };
    }

    const lancamentos = await prisma.lancamentoContabil.findMany({
      where,
      include: {
        itens: {
          orderBy: { debito: "desc" },
        },
      },
      orderBy: { data: "desc" },
    });

    // Converter Decimal para string para evitar erro de serialização
    const lancamentosSerializados = lancamentos.map((lanc: any) => ({
      ...lanc,
      totalDebito: lanc.totalDebito.toString(),
      totalCredito: lanc.totalCredito.toString(),
      itens: lanc.itens.map((item: any) => ({
        ...item,
        debito: item.debito.toString(),
        credito: item.credito.toString(),
      })),
    }));

    return NextResponse.json(lancamentosSerializados);
  } catch (error) {
    console.error("Erro ao buscar lançamentos:", error);
    return NextResponse.json(
      { message: "Erro ao buscar lançamentos" },
      { status: 500 }
    );
  }
}

// Criar novo lançamento
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { data, descricao, documento, tipo, observacoes, itens } = body;

    if (!data || !descricao || !itens || itens.length === 0) {
      return NextResponse.json(
        { message: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    // Validar partidas dobradas
    let totalDebito = 0;
    let totalCredito = 0;

    for (const item of itens) {
      totalDebito += parseFloat(item.debito || 0);
      totalCredito += parseFloat(item.credito || 0);
    }

    if (Math.abs(totalDebito - totalCredito) > 0.01) {
      return NextResponse.json(
        { message: "Partidas dobradas inválidas: Débito deve ser igual ao Crédito" },
        { status: 400 }
      );
    }

    // Buscar informações das contas
    const itensComContas = await Promise.all(
      itens.map(async (item: any) => {
        const conta = await prisma.contaContabil.findUnique({
          where: { id: item.contaContabilId },
        });

        if (!conta) {
          throw new Error(`Conta com ID ${item.contaContabilId} não encontrada`);
        }

        if (!conta.aceitaLancamento) {
          throw new Error(`A conta ${conta.codigo} - ${conta.nome} não aceita lançamentos (conta sintética)`);
        }

        return {
          contaContabilId: item.contaContabilId,
          codigoConta: conta.codigo,
          nomeConta: conta.nome,
          debito: parseFloat(item.debito || 0),
          credito: parseFloat(item.credito || 0),
        };
      })
    );

    // Criar lançamento
    const novoLancamento = await prisma.lancamentoContabil.create({
      data: {
        data: new Date(data),
        descricao,
        documento: documento || null,
        tipo: tipo || "NORMAL",
        totalDebito,
        totalCredito,
        status: "ATIVO",
        periodoId:"cmm1krobk0000lc90d4ympj9q",
        observacoes: observacoes || null,
        criadoPor: session?.user?.id || "",
        itens: {
          create: itensComContas,
        },
      },
      include: {
        itens: true,
      },
    });

    // Serializar para retorno
    const lancamentoSerializado = {
      ...novoLancamento,
      totalDebito: novoLancamento.totalDebito.toString(),
      totalCredito: novoLancamento.totalCredito.toString(),
      itens: novoLancamento.itens.map((item: any) => ({
        ...item,
        debito: item.debito.toString(),
        credito: item.credito.toString(),
      })),
    };

    return NextResponse.json(lancamentoSerializado, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar lançamento:", error);
    return NextResponse.json(
      { message: error?.message || "Erro ao criar lançamento" },
      { status: 500 }
    );
  }
}
