import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, senha, name, nome } = body;
    
    // Aceitar tanto "senha" quanto "password", "nome" quanto "name"
    const senhaFinal = senha || password;
    const nomeFinal = nome || name;

    if (!email || !senhaFinal || !nomeFinal) {
      return NextResponse.json(
        { message: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se usuário já existe
    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      return NextResponse.json(
        { message: 'Este email já está cadastrado' },
        { status: 400 }
      );
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senhaFinal, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email,
        senha: senhaHash,
        nome: nomeFinal,
        ativo: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Usuário criado com sucesso',
        user: { id: user.id, email: user.email, nome: user.nome },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json(
      { message: 'Erro ao criar usuário' },
      { status: 500 }
    );
  }
}
