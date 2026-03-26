import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";


export async function GET() {
  const roles = await prisma.role.findMany({
    where: { ativo: true },
    include: {
      permissions: {
        include: {
          permission: true,
        }
      },
      criadopor: true,
    }
  });
  return NextResponse.json(roles);
}


export async function POST(req: Request) {

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Não Autenticado" }, { status: 401 });
    }

    if (!session?.user?.permissions?.includes("utilizadores.criar")) {
      return NextResponse.json({ message: "Sem permissão" }, { status: 401 });
    }

    const body = await req.json();
    const { nome, descricao, permissoes } = body;

    if (!nome.trim() || !descricao.trim()) {
      return NextResponse.json({ message: "Nome e descrição são obrigatórios" }, { status: 400 });
    }
    if (descricao.length > 50) {
      return NextResponse.json({ message: "Descrição longa de mais, o máximo são 30 caracteres" }, { status: 400 });
    }

    const nomeExiste = await prisma.role.findUnique(
      {
        where: { nome: nome.trim(), }
      }
    );

    if(nomeExiste) {
      return NextResponse.json({ message: "Nomes de papeis devem ser únicos, por favor insira um nome diferente" }, { status: 400 });
    }

    const nomeRegex = /^[A-za-z0-9]{6,30}$/;
    if (!nomeRegex.test(nome.trim())) {
      return NextResponse.json(
        { message: "Nome inválido. Deve ter entre 6 a 30 caracteres alfanuméricos." },
        { status: 400 }
      );
    }



    const papel = await prisma.$transaction(async (tx) => {
      const papel = await tx.role.create({
        data: {
          nome: nome.trim(),
          descricao: descricao,
          criadoporId: session.user.id,
        }
      });

      const vinculoPermissions = permissoes.map((per: any) => {
        return {
          roleId: papel.id,
          permissionId: per.id,
        }
      })

      await tx.rolePermission.createMany({
        data: vinculoPermissions,
      });

      return papel;
    })

    return NextResponse.json(papel, { status: 200 });
  } catch (erro: any) {
    console.log(erro);
    return NextResponse.json({ message: "Erro ao criar papel" }, { status: 500 });
  }

}


export async function DELETE(req: Request,
) {

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Não Autenticado" }, { status: 401 });
    }

    if (!session?.user?.permissions?.includes("utilizadores.editar")) {
      return NextResponse.json({ message: "Sem permissão para eliminar" }, { status: 401 });
    }

    const body = await req.json();
    const {papeis} = body;

    if (!papeis) {
      return NextResponse.json({ message: "Nenhum papel seleionado" }, { status: 400 });
    }

    if (papeis.length < 2) {
      return NextResponse.json({ message: "Selecione pelo menos dois perfis a apagar" }, { status: 400 });
    }

    for (const b of papeis) {
      let acc = 0;
      let nomes = [];
      const totalApa = await prisma.userRole.count(
        {
          where: { roleId: b.id }
        })

      if (b.nome === "ADMIN") {
        return NextResponse.json({ message: "O papel de Admin não pode ser desativado por ser uma predefinição do sistema. Por favor, desselecione-o" }, { status: 400 });
      }

      const usuariosRole = await prisma.userRole.findMany({
        where: { roleId: b.id },
      });

      for (const u of usuariosRole) {
        const tem = await prisma.userRole.count(
          {
            where: { userId: u.userId },
          }
        )

        if (tem >= 2) {
          acc += 2;
        }
        else {
          const nome = await prisma.user.findUnique({ where: { id: u.userId } })
          if (nome)
            nomes.push({ nome: nome.nome });
        }
      }
      let no = "";
      if (nomes) {
        for (const n of nomes) {
          no += n.nome + ", ";
        }
      }
      if (acc < totalApa * 2) {
        return NextResponse.json({ message: `Existem usuários que só estão vinculados a um papel dos selecionados. Verifique estes usuários e conceda outros perfis ou desative-os para poder eliminar os perfis: ${no.substring(0, no.length - 2) + "."}` }, { status: 400 });
      }
    }

    await prisma.$transaction(async (tx) =>{
      for(const p of papeis){
      await prisma.role.delete({where:{id: p.id}});
    }
    })
   


    return NextResponse.json({ status: 200 });
  } catch (erro: any) {
    console.log(erro);
    return NextResponse.json({ message: "Ocorreu um erro ao eliminar o perfil" }, { status: 400 });
  }

}

