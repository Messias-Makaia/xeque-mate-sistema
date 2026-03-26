import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";


export async function DELETE(req: Request,
    { params }: { params: { id: string } }
) {

    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Não Autenticado" }, { status: 401 });
        }

        if (!session?.user?.permissions?.includes("utilizadores.editar")) {
            return NextResponse.json({ message: "Sem permissão para eliminar" }, { status: 401 });
        }

        const { id } = params;

        const papelExiste = await prisma.role.findUnique(
            {
                where: { id }
            }
        );


        if (!papelExiste) {
            return NextResponse.json({ message: "Papel não encontrado" }, { status: 400 });
        }

        if (papelExiste.nome === "ADMIN") {
            return NextResponse.json({ message: "O papel de Admin não pode ser desativado por ser uma predefinição do sistema" }, { status: 400 });
        }
        let acc = 0;
        let nomes = [];

        const totalApa = await prisma.userRole.count(
            {
                where: { roleId: id }
            })

        const usuariosRole = await prisma.userRole.findMany({
            where: { roleId: id },
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
            return NextResponse.json({ message: `Existem usuários vinculados apenas a este perfil. Para poder eliminá-lo conceda outros perfis ou desative o(s) seguinte(s) usuário(s): ${no.substring(0, no.length - 2) + "."}` }, { status: 400 });
        }

        const papel = await prisma.role.delete(
            {where:{id:id}},
        );

        return NextResponse.json(papel, { status: 200 });
    } catch (erro: any) {
        console.log(erro);
        return NextResponse.json({ message: "Ocorreu um erro ao eliminar o perfil" }, { status: 400 });
    }

}