import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 A iniciar o seed de permissões...");

  // 1. Definir as Permissões do Sistema
  const permissoesDefinidas = [
    // Contas
    { nome: "contas.ver", recurso: "Contas", acao: "VER", descricao: "Ver plano de contas" },
    { nome: "contas.criar", recurso: "Contas", acao: "CRIAR", descricao: "Criar novas contas" },
    { nome: "contas.editar", recurso: "Contas", acao: "EDITAR", descricao: "Editar contas existentes" },
    { nome: "contas.cancelar", recurso: "Contas", acao: "CANCELAR", descricao: "Desativar contas" },

    // Lançamentos
    { nome: "lancamentos.ver", recurso: "Lançamentos", acao: "VER", descricao: "Ver lançamentos" },
    { nome: "lancamentos.criar", recurso: "Lançamentos", acao: "CRIAR", descricao: "Criar novos lançamentos" },
    { nome: "lancamentos.estornar", recurso: "Lançamentos", acao: "ESTORNAR", descricao: "Efetuar estornos" },

    // Períodos
    { nome: "periodos.ver", recurso: "Períodos", acao: "VER", descricao: "Ver períodos contabilísticos" },
    { nome: "periodos.fechar", recurso: "Períodos", acao: "FECHAR", descricao: "Fechar períodos e exercícios" },
    
    //Exercicios
    {nome: "exercicios.ver", recurso: "Exercicios", acao: "VER", descricao: "Ver exercicios"},
    {nome: "exercicios.criar", recurso: "Exercicios", acao: "CRIAR", descricao: "Criar e excluir exercicios"},
    {nome: "exercicios.encerrar", recurso: "Exercicios", acao: "Encerrar", descricao: "Encerrar exercicios"},
    
    // Utilizadores e Configurações
    { nome: "utilizadores.ver", recurso: "Utilizadores", acao: "VER", descricao: "Ver lista de utilizadores" },
    { nome: "utilizadores.criar", recurso: "Utilizadores", acao: "CRIAR", descricao: "Criar novos utilizadores" },
    { nome: "utilizadores.editar", recurso: "Utilizadores", acao: "EDITAR", descricao: "Editar permissões e dados" },

    // Relatórios
    { nome: "razao.ver", recurso: "Relatórios", acao: "GERAR", descricao: "Gerar Razão" },
    { nome: "balanco.ver", recurso: "Relatórios", acao: "GERAR", descricao: "Gerar Balanço"},
    { nome: "balancetes.ver", recurso: "Relatórios", acao: "GERAR", descricao: "Gerar Balancete"},
    { nome: "dre.ver", recurso: "Relatórios", acao: "GERAR", descricao: "Gerar DRE"},
    { nome: "diario.ver", recurso: "Relatórios", acao: "GERAR", descricao: "Gerar Diário"},

    ];

  console.log("📦 A criar permissões...");
  const permissoesCriadas = [];
  for (const p of permissoesDefinidas) {
    const perm = await prisma.permission.upsert({
      where: { nome: p.nome },
      update: p,
      create: p,
    });
    permissoesCriadas.push(perm);
  }

  // 2. Criar os Roles (Papéis)
  console.log("👥 A criar papéis (Roles)...");

  // ADMIN - Acesso Total
  const roleAdmin = await prisma.role.upsert({
    where: { nome: "ADMIN" },
    update: {},
    create: {
      nome: "ADMIN",
      descricao: "Administrador Total do Sistema",
    },
  });

  // CONTABILISTA - Operações de Contabilidade
  const roleContabilista = await prisma.role.upsert({
    where: { nome: "CONTABILISTA" },
    update: {},
    create: {
      nome: "CONTABILISTA",
      descricao: "Operador de Lançamentos e Contas",
    },
  });

  // VISUALIZADOR - Apenas Consulta
  const roleVisualizador = await prisma.role.upsert({
    where: { nome: "VISUALIZADOR" },
    update: {},
    create: {
      nome: "VISUALIZADOR",
      descricao: "Acesso de leitura para auditoria",
    },
  });

  // 3. Associar Permissões aos Roles
  console.log("🔗 A associar permissões aos papéis...");

  // Admin ganha TUDO
  for (const p of permissoesCriadas) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: roleAdmin.id, permissionId: p.id } },
      update: {},
      create: { roleId: roleAdmin.id, permissionId: p.id },
    });
  }

  // Contabilista ganha quase tudo (exceto gestão de utilizadores e fecho de períodos)
  const permsContabilista = permissoesCriadas.filter(p => 
    !p.nome.startsWith("utilizadores") && p.nome !== "periodos.fechar"
  );
  for (const p of permsContabilista) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: roleContabilista.id, permissionId: p.id } },
      update: {},
      create: { roleId: roleContabilista.id, permissionId: p.id },
    });
  }

  // Visualizador ganha apenas as permissões ".ver"
  const permsVisualizador = permissoesCriadas.filter(p => p.nome.endsWith(".ver"));
  for (const p of permsVisualizador) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: roleVisualizador.id, permissionId: p.id } },
      update: {},
      create: { roleId: roleVisualizador.id, permissionId: p.id },
    });
  }

  // 4. Criar Utilizador Administrador Padrão
  console.log("👤 A criar utilizador admin...");
  const senhaHash = await bcrypt.hash("admin123", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@sistema.com" },
    update: {},
    create: {
      email: "admin@sistema.com",
      nome: "Administrador do Sistema",
      senha: senhaHash,
      ativo: true,
    },
  });

  // Atribuir Role ADMIN ao utilizador
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: roleAdmin.id } },
    update: {},
    create: { userId: adminUser.id, roleId: roleAdmin.id },
  });

  console.log("✅ Seed finalizado com sucesso!");
  console.log("📧 Email: admin@sistema.com | Senha: admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });