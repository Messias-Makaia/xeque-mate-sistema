import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import Email from "next-auth/providers/email";

export async function GET() {

 
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Não autenticado", { status: 401 });

  if (!session?.user?.permissions.includes("utilizadores.ver")) {
    return new NextResponse("Não autorizado", { status: 403 });
  }

  const users = await prisma.user.findMany({
    include: {
      roles: { include: { role: true } }
    },
    orderBy: { nome: 'asc' }
  });

  return NextResponse.json(users);
}

export async function POST(req: Request) {
   try{
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Não autenticado", { status: 401 });
  if (!session?.user?.permissions.includes("utilizadores.criar")) {
    return new NextResponse("Não autorizado", { status: 403 });
  }

  const { nome, email, senha, roles } = await req.json();
  if (!nome.trim() || !senha.trim() || !email) return NextResponse.json({ message: "Nome, senha e email são obrigatórios" }, { status: 400 });

  if (nome.trim().length < 6) return NextResponse.json({ message: "Nome muito curto, deve ter pelo menos 6 caracteres" }, { status: 400 });

  if (!roles) return NextResponse.json({ message: "Selecione pelo menos um papel para o usuário" }, { status: 400 });

  const verificarEmail = await prisma.user.findUnique({where:{email}});

  if(verificarEmail) return NextResponse.json({ message: "Email inválido, já existe um usuário com este email" }, { status: 400 });
  

  const hashedSenha = await bcrypt.hash(senha, 10);

  const novoUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        nome,
        email,
        senha: hashedSenha,
        criadoPor: session.user.id,
        }
  });

 const p = roles.map((r:any)=> ({
    roleId: r.id,
    userId: user.id,
  }))

  await tx.userRole.createMany(
    {data:p}
  )

  return user;})

return NextResponse.json(novoUser, {status: 200});
} catch (erro:any){
  console.log("Ocorreu um erro: ",erro);
  return NextResponse.json({message: "Erro ao criar usário"}, {status:500});
}
}