import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

// Buscar lançamento específico
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
    }

    const lancamento = await prisma.lancamentoContabil.findUnique({
      where: { id: params.id },
      include: {
        itens: {
          orderBy: { debito: "desc" },
        },
      },
    });

    if (!lancamento) {
      return NextResponse.json(
        { message: "Lançamento não encontrado" },
        { status: 404 }
      );
    }

    // Serializar
    const lancamentoSerializado = {
      ...lancamento,
      totalDebito: lancamento.totalDebito.toString(),
      totalCredito: lancamento.totalCredito.toString(),
      itens: lancamento.itens.map((item: any) => ({
        ...item,
        debito: item.debito.toString(),
        credito: item.credito.toString(),
      })),
    };

    return NextResponse.json(lancamentoSerializado);
  } catch (error) {
    console.error("Erro ao buscar lançamento:", error);
    return NextResponse.json(
      { message: "Erro ao buscar lançamento" },
      { status: 500 }
    );
  }
}

// Editar lançamento
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { data, descricao, documento, observacoes, itens } = body;

    // Verificar se o lançamento existe
    const lancamentoExistente = await prisma.lancamentoContabil.findUnique({
      where: { id: params.id },
      include: { itens: true },
    });

    if (!lancamentoExistente) {
      return NextResponse.json(
        { message: "Lançamento não encontrado" },
        { status: 404 }
      );
    }

    // Não permitir edição de lançamentos cancelados ou estornados
    if (lancamentoExistente.status !== "ATIVO") {
      return NextResponse.json(
        { message: "Não é possível editar lançamentos cancelados ou estornados" },
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
          throw new Error(`A conta ${conta.codigo} - ${conta.nome} não aceita lançamentos`);
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

    // Deletar itens antigos e criar novos
    await prisma.itemLancamento.deleteMany({
      where: { lancamentoId: params.id },
    });

    // Atualizar lançamento
    const lancamentoAtualizado = await prisma.lancamentoContabil.update({
      where: { id: params.id },
      data: {
        data: data ? new Date(data) : lancamentoExistente.data,
        descricao: descricao || lancamentoExistente.descricao,
        documento: documento !== undefined ? documento : lancamentoExistente.documento,
        observacoes: observacoes !== undefined ? observacoes : lancamentoExistente.observacoes,
        totalDebito,
        totalCredito,
        itens: {
          create: itensComContas,
        },
      },
      include: {
        itens: true,
      },
    });

    // Serializar
    const lancamentoSerializado = {
      ...lancamentoAtualizado,
      totalDebito: lancamentoAtualizado.totalDebito.toString(),
      totalCredito: lancamentoAtualizado.totalCredito.toString(),
      itens: lancamentoAtualizado.itens.map((item: any) => ({
        ...item,
        debito: item.debito.toString(),
        credito: item.credito.toString(),
      })),
    };

    return NextResponse.json(lancamentoSerializado);
  } catch (error: any) {
    console.error("Erro ao editar lançamento:", error);
    return NextResponse.json(
      { message: error?.message || "Erro ao editar lançamento" },
      { status: 500 }
    );
  }
}

// Cancelar lançamento
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
    }

    // Cancelar (não deletar)
    const lancamentoCancelado = await prisma.lancamentoContabil.update({
      where: { id: params.id },
      data: { status: "CANCELADO" },
    });

    return NextResponse.json({
      ...lancamentoCancelado,
      totalDebito: lancamentoCancelado.totalDebito.toString(),
      totalCredito: lancamentoCancelado.totalCredito.toString(),
    });
  } catch (error) {
    console.error("Erro ao cancelar lançamento:", error);
    return NextResponse.json(
      { message: "Erro ao cancelar lançamento" },
      { status: 500 }
    );
  }
}

