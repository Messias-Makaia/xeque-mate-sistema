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
    { nome: "lancamentos.editar", recurso: "Lançamentos", acao: "ESTORNAR", descricao: "Efetuar estornos" },
    
    // Períodos
    { nome: "periodos.ver", recurso: "Períodos", acao: "VER", descricao: "Ver períodos contabilísticos" },
    { nome: "periodos.fechar", recurso: "Períodos", acao: "FECHAR", descricao: "Fechar períodos e exercícios"},
    
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

  console.log('\n📊 Criando Plano de Contas...');
const contas = [
    // ========== CLASSE 1: MEIOS FIXOS E INVESTIMENTOS ==========
    { codigo: '1', nome: 'MEIOS FIXOS E INVESTIMENTOS', tipo: 'ATIVO', natureza: 'DEVEDORA', nivel: 1, aceitaLancamento: false },
    
    // 11 - Imobilizações Corpóreas
    { codigo: '11', nome: 'Imobilizações Corpóreas', tipo: 'ATIVO', natureza: 'DEVEDORA', nivel: 2, contaPai: '1', aceitaLancamento: false },
    { codigo: '11.2', nome: 'Edifícios e Outras Construções', tipo: 'ATIVO', natureza: 'DEVEDORA', nivel: 3, contaPai: '11', aceitaLancamento: false, descricao: 'Instalações da farmácia' },
    { codigo: '11.3', nome: 'Equipamento Básico', tipo: 'ATIVO', natureza: 'DEVEDORA', nivel: 3, contaPai: '11', aceitaLancamento: false, descricao: 'Balanças, refrigeradores, etc' },
    { codigo: '11.5', nome: 'Equipamento Administrativo', tipo: 'ATIVO', natureza: 'DEVEDORA', nivel: 3, contaPai: '11', aceitaLancamento: false, descricao: 'Computadores, impressoras, mobiliário' },
    
    // 18 - Amortizações Acumuladas
    { codigo: '18', nome: 'Amortizações Acumuladas', tipo: 'ATIVO', natureza: 'CREDORA', nivel: 2, contaPai: '1', aceitaLancamento: false },
    { codigo: '18.1', nome: 'Amortizações de Imobilizações Corpóreas', tipo: 'ATIVO', natureza: 'CREDORA', nivel: 3, contaPai: '18', aceitaLancamento: false },

    // ========== CLASSE 2: EXISTÊNCIAS ==========
    { codigo: '2', nome: 'EXISTÊNCIAS', tipo: 'ATIVO', natureza: 'DEVEDORA', nivel: 1, aceitaLancamento: false },
    
    // 26 - Mercadorias
    { codigo: '26', nome: 'Mercadorias', tipo: 'ATIVO', natureza: 'DEVEDORA', nivel: 2, contaPai: '2', aceitaLancamento: false },
    { codigo: '26.1', nome: 'Medicamentos', tipo: 'ATIVO', natureza: 'DEVEDORA', nivel: 3, contaPai: '26', aceitaLancamento: true, descricao: 'Estoque de medicamentos' },
    { codigo: '26.2', nome: 'Produtos de Higiene e Cosmética', tipo: 'ATIVO', natureza: 'DEVEDORA', nivel: 3, contaPai: '26', aceitaLancamento: true },
    { codigo: '26.3', nome: 'Outros Produtos', tipo: 'ATIVO', natureza: 'DEVEDORA', nivel: 3, contaPai: '26', aceitaLancamento: true },

    // ========== CLASSE 3: TERCEIROS ==========
    { codigo: '3', nome: 'TERCEIROS', tipo: 'ATIVO', natureza: 'DEVEDORA', nivel: 1, aceitaLancamento: false },
    
    // 31 - Clientes
    { codigo: '31', nome: 'Clientes', tipo: 'ATIVO', natureza: 'DEVEDORA', nivel: 2, contaPai: '3', aceitaLancamento: false },
    { codigo: '31.1', nome: 'Clientes - Correntes', tipo: 'ATIVO', natureza: 'DEVEDORA', nivel: 3, contaPai: '31', aceitaLancamento: true },
    
    // 32 - Fornecedores
    { codigo: '32', nome: 'Fornecedores', tipo: 'PASSIVO', natureza: 'CREDORA', nivel: 2, contaPai: '3', aceitaLancamento: false },
    { codigo: '32.1', nome: 'Fornecedores - Correntes', tipo: 'PASSIVO', natureza: 'CREDORA', nivel: 3, contaPai: '32', aceitaLancamento: true },
    
    // 34 - Estado
    { codigo: '34', nome: 'Estado', tipo: 'PASSIVO', natureza: 'CREDORA', nivel: 2, contaPai: '3', aceitaLancamento: false },
    { codigo: '34.1', nome: 'Imposto sobre os lucros', tipo: 'PASSIVO', natureza: 'CREDORA', nivel: 3, contaPai: '34', aceitaLancamento: false},
    { codigo: '34.2', nome: 'Imposto de produção e consumo', tipo: 'PASSIVO', natureza: 'CREDORA', nivel: 3, contaPai: '34', aceitaLancamento: false},
    { codigo: '34.3', nome: 'Imposto de rendimento de trabalho', tipo: 'PASSIVO', natureza: 'CREDORA', nivel: 3, contaPai: '34', aceitaLancamento: false },
    
    // 36 - Pessoal
    { codigo: '36', nome: 'Pessoal', tipo: 'PASSIVO', natureza: 'CREDORA', nivel: 2, contaPai: '3', aceitaLancamento: false },
    { codigo: '36.1', nome: 'Pessoal-reumerações', tipo: 'PASSIVO', natureza: 'CREDORA', nivel: 3, contaPai: '36', aceitaLancamento: false },

    // ========== CLASSE 4: MEIOS MONETÁRIOS ==========
    { codigo: '4', nome: 'MEIOS MONETÁRIOS', tipo: 'ATIVO', natureza: 'DEVEDORA', nivel: 1, aceitaLancamento: false },
    
    // 43 - Depósitos à Ordem
    { codigo: '43', nome: 'Depósitos à Ordem', tipo: 'ATIVO', natureza: 'DEVEDORA', nivel: 2, contaPai: '4', aceitaLancamento: false },
    { codigo: '43.1', nome: 'Moeda Nacional', tipo: 'ATIVO', natureza: 'DEVEDORA', nivel: 3, contaPai: '43', aceitaLancamento: false},
    
    // 45 - Caixa
    { codigo: '45', nome: 'Caixa', tipo: 'ATIVO', natureza: 'DEVEDORA', nivel: 2, contaPai: '4', aceitaLancamento: false },
    { codigo: '45.1', nome: 'Fundo Fixo', tipo: 'ATIVO', natureza: 'DEVEDORA', nivel: 3, contaPai: '45', aceitaLancamento: false },

    // ========== CLASSE 5: CAPITAL E RESERVAS ==========
    { codigo: '5', nome: 'CAPITAL E RESERVAS', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 1, aceitaLancamento: false },
    
    // 51 - Capital
    { codigo: '51', nome: 'Capital', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 2, contaPai: '5', aceitaLancamento: false},
    
    // 55 - Reservas Legais
    { codigo: '55', nome: 'Reservas Legais', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 2, contaPai: '5', aceitaLancamento: false },
    
    // 58 - Reservas Livres
    { codigo: '58', nome: 'Reservas Livres', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 2, contaPai: '5', aceitaLancamento: false },

    // ========== CLASSE 6: PROVEITOS/RECEITAS ==========
    { codigo: '6', nome: 'PROVEITOS E GANHOS POR NATUREZA', tipo: 'RECEITA', natureza: 'CREDORA', nivel: 1, aceitaLancamento: false },
    
    // 61 - Vendas
    { codigo: '61', nome: 'Vendas', tipo: 'RECEITA', natureza: 'CREDORA', nivel: 2, contaPai: '6', aceitaLancamento: false },
    { codigo: '61.1', nome: 'Produtos acabados e intermédios', tipo: 'RECEITA', natureza: 'CREDORA', nivel: 3, contaPai: '61', aceitaLancamento: true },
    { codigo: '61.1.1', nome: 'Mercado nacional', tipo: 'RECEITA', natureza: 'CREDORA', nivel: 4, contaPai: '61.1', aceitaLancamento: true },
    { codigo: '61.3', nome: 'Mercadorias', tipo: 'RECEITA', natureza: 'CREDORA', nivel: 3, contaPai: '61', aceitaLancamento: false },
    { codigo: '61.3.1', nome: 'Mercado nacional', tipo: 'RECEITA', natureza: 'CREDORA', nivel: 4, contaPai: '61.3', aceitaLancamento: true },
    
    // 62 - Prestações de Serviços
    { codigo: '62', nome: 'Prestações de Serviço', tipo: 'RECEITA', natureza: 'CREDORA', nivel: 2, contaPai: '6', aceitaLancamento: false },
    { codigo: '62.1', nome: 'Serviços principais', tipo: 'RECEITA', natureza: 'CREDORA', nivel: 3, contaPai: '62', aceitaLancamento: false, descricao: 'Medições, injeções, etc' },
    { codigo: '62.1.1', nome: 'Mercado nacional', tipo: 'RECEITA', natureza: 'CREDORA', nivel: 4, contaPai: '62.1', aceitaLancamento: true },
    
    // 66 - Proveitos e Ganhos Financeiros
    { codigo: '66', nome: 'Proveitos e Ganhos Financeiros Gerais', tipo: 'RECEITA', natureza: 'CREDORA', nivel: 2, contaPai: '6', aceitaLancamento: false },
    { codigo: '66.1', nome: 'Juros', tipo: 'RECEITA', natureza: 'CREDORA', nivel: 3, contaPai: '66', aceitaLancamento: false},
    { codigo: '66.1.1', nome: 'De investimentos financeiros', tipo: 'RECEITA', natureza: 'CREDORA', nivel: 4, contaPai: '66.1', aceitaLancamento: false },
    { codigo: '66.1.1.1', nome: 'Obrigações', tipo: 'RECEITA', natureza: 'CREDORA', nivel: 5, contaPai: '66.1.1', aceitaLancamento: true },
    // ========== CLASSE 7: CUSTOS E PERDAS ==========
    { codigo: '7', nome: 'CUSTOS E PERDAS', tipo: 'CUSTO', natureza: 'DEVEDORA', nivel: 1, aceitaLancamento: false },
    
    // 71 - Custo das Mercadorias Vendidas
    { codigo: '71', nome: 'Custo das Existências vendidas', tipo: 'CUSTO', natureza: 'DEVEDORA', nivel: 2, contaPai: '7', aceitaLancamento: false },
    { codigo: '71.1', nome: 'Matérias-primas', tipo: 'CUSTO', natureza: 'DEVEDORA', nivel: 3, contaPai: '71', aceitaLancamento: false },
    { codigo: '71.2', nome: 'Matérias subsidiárias', tipo: 'CUSTO', natureza: 'DEVEDORA', nivel: 3, contaPai: '71', aceitaLancamento: false },
    { codigo: '71.3', nome: 'Materiais Diretos', tipo: 'CUSTO', natureza: 'DEVEDORA', nivel: 3, contaPai: '71', aceitaLancamento: false },
    { codigo: '71.9', nome: 'Transferência para resultados operacionais', tipo: 'CUSTO', natureza: 'DEVEDORA', nivel: 3, contaPai: '71', aceitaLancamento: true},
    // 72 - Custos com Pessoal
    { codigo: '72', nome: 'Custos com o Pessoal', tipo: 'CUSTO', natureza: 'DEVEDORA', nivel: 2, contaPai: '7', aceitaLancamento: false },
    { codigo: '72.1', nome: 'Remunerações Órgãos Sociais', tipo: 'CUSTO', natureza: 'DEVEDORA', nivel: 3, contaPai: '72', aceitaLancamento: false },
    { codigo: '72.5', nome: 'Encargos sobre Remunerações', tipo: 'CUSTO', natureza: 'DEVEDORA', nivel: 3, contaPai: '72', aceitaLancamento: false },
    
    // 73 - Amortizações
    { codigo: '73', nome: 'Amortizações do Exercício', tipo: 'CUSTO', natureza: 'DEVEDORA', nivel: 2, contaPai: '7', aceitaLancamento: false },
    { codigo: '73.1', nome: 'Imobilizações Corpóreas', tipo: 'CUSTO', natureza: 'DEVEDORA', nivel: 3, contaPai: '73', aceitaLancamento: false},
    
    // 75 - Outros Custos Operacionais
    { codigo: '75', nome: 'Outros Custos e Perdas Operacionais', tipo: 'CUSTO', natureza: 'DEVEDORA', nivel: 2, contaPai: '7', aceitaLancamento: false },
    { codigo: '75.2', nome: 'Fornecimentos e Serviços de Terceiros', tipo: 'CUSTO', natureza: 'DEVEDORA', nivel: 3, contaPai: '75', aceitaLancamento: false },
    { codigo: '75.2.11', nome: 'Água', tipo: 'CUSTO', natureza: 'DEVEDORA', nivel: 4, contaPai: '75.2', aceitaLancamento: true },
    { codigo: '75.2.12', nome: 'Electricidade', tipo: 'CUSTO', natureza: 'DEVEDORA', nivel: 4, contaPai: '75.2', aceitaLancamento: true },
    { codigo: '75.2.14', nome: 'Conservação e Reparação', tipo: 'CUSTO', natureza: 'DEVEDORA', nivel: 4, contaPai: '75.2', aceitaLancamento: true },
    { codigo: '75.2.17', nome: 'Material de Escritório', tipo: 'CUSTO', natureza: 'DEVEDORA', nivel: 4, contaPai: '75.2', aceitaLancamento: true },
    { codigo: '75.2.20', nome: 'Comunicação', tipo: 'CUSTO', natureza: 'DEVEDORA', nivel: 4, contaPai: '75.2', aceitaLancamento: true },
    { codigo: '75.2.21', nome: 'Rendas e Alugueres', tipo: 'CUSTO', natureza: 'DEVEDORA', nivel: 4, contaPai: '75.2', aceitaLancamento: true },
    { codigo: '75.2.22', nome: 'Seguros', tipo: 'CUSTO', natureza: 'DEVEDORA', nivel: 4, contaPai: '75.2', aceitaLancamento: true },
    { codigo: '75.2.29', nome: 'Publicidade e Propaganda', tipo: 'CUSTO', natureza: 'DEVEDORA', nivel: 4, contaPai: '75.2', aceitaLancamento: true },
    
    { codigo: '75.3', nome: 'Impostos', tipo: 'CUSTO', natureza: 'DEVEDORA', nivel: 3, contaPai: '75', aceitaLancamento: false},
    { codigo: '75.3.1', nome: 'Indirectos', tipo: 'CUSTO', natureza: 'DEVEDORA', nivel: 4, contaPai: '75.3', aceitaLancamento: false},
    { codigo: '75.3.1.1', nome: 'Imposto de selo', tipo: 'CUSTO', natureza: 'DEVEDORA', nivel: 5, contaPai: '75.3.1', aceitaLancamento: true},
    { codigo: '75.3.1.2', nome: 'Imposto sobre o Valor Acrescentado', tipo: 'CUSTO', natureza: 'DEVEDORA', nivel: 5, contaPai: '75.3.1', aceitaLancamento: true},
    { codigo: '75.3.2', nome: 'Diretos', tipo: 'CUSTO', natureza: 'DEVEDORA', nivel: 4, contaPai: '75.3', aceitaLancamento: false},
    
    // 76 - Custos Financeiros
    { codigo: '76', nome: 'Custos e Perdas Financeiros', tipo: 'CUSTO', natureza: 'DEVEDORA', nivel: 2, contaPai: '7', aceitaLancamento: false },
    { codigo: '76.1', nome: 'Juros', tipo: 'CUSTO', natureza: 'DEVEDORA', nivel: 3, contaPai: '76', aceitaLancamento: false},
    { codigo: '76.7', nome: 'Serviços Bancários', tipo: 'CUSTO', natureza: 'DEVEDORA', nivel: 3, contaPai: '76', aceitaLancamento: false },

    // ========== CLASSE 8: RESULTADOS ==========
    { codigo: '8', nome: 'RESULTADOS', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 1, aceitaLancamento: false },
    
    { codigo: '81', nome: 'Resultados Transitados', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 2, contaPai: '8', aceitaLancamento: false },
    { codigo: '81.1', nome: 'Ano', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 3, contaPai: '81.1', aceitaLancamento: false },
    { codigo: '81.1.1', nome: 'Resultado do Ano', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 4, contaPai: '81.1', aceitaLancamento: true},
    { codigo: '81.1.2', nome: 'Aplicação de resultados', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 4, contaPai: '81.1', aceitaLancamento: true},
    { codigo: '81.1.3', nome: 'Correcções de erros fundamentais, no exercicício seguinte', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 4, contaPai: '81.1', aceitaLancamento: true},
    { codigo: '81.1.4', nome: 'Efeito das alterações de políticas contabilísticas', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 4, contaPai: '81.1', aceitaLancamento: true},
    { codigo: '81.1.5', nome: 'Imposto relativo a correcções de erros fundamentais  e alterações de políticas contabilísticas', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 4, contaPai: '81.1', aceitaLancamento: true},
    { codigo: '82', nome: 'Resultados Operacionais', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 2, contaPai: '8', aceitaLancamento: false },
    { codigo: '82.1', nome: 'Vendas', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 3, contaPai: '82', aceitaLancamento: true },
    { codigo: '82.2', nome: 'Prestações de Serviços', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 3, contaPai: '82', aceitaLancamento: true },
    { codigo: '82.3', nome: 'Outros proveitos operacionais', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 3, contaPai: '82', aceitaLancamento: true },
    { codigo: '82.4', nome: 'Variação nos inventários de produtos acabados e produtos em vias de fábrico', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 3, contaPai: '82', aceitaLancamento: true },
    { codigo: '82.5', nome: 'Trabalhos para a própria empresa', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 3, contaPai: '82', aceitaLancamento: true },
    { codigo: '82.6', nome: 'Custo das mercadorias vendidas e das matérias consumidas', natureza: 'CREDORA', tipo: 'CAPITAL', nivel: 3, contaPai: '82', aceitaLancamento: true},
    { codigo: '82.7', nome: 'Custos com o pessoal', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 3, contaPai: '82', aceitaLancamento: true },
    { codigo: '82.8', nome: 'Amortizações do exercício', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 3, contaPai: '82', aceitaLancamento: true },
    { codigo: '82.9', nome: 'Outros custos operacionais', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 3, contaPai: '82', aceitaLancamento: true },
    { codigo: '82.19', nome: 'Transfarência para resultados líquidos', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 3, contaPai: '82', aceitaLancamento: true },
    { codigo: '83', nome: 'Resultados Financeiros', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 2, contaPai: '8', aceitaLancamento: false },
    { codigo: '83.1', nome: 'Proveitos e ganhos financeiros gerais', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 3, contaPai: '83', aceitaLancamento: true },
    { codigo: '83.2', nome: 'Custos e perdas financeiros gerais', tipo: 'CAPITAL', natureza: 'DEVEDORA', nivel: 3, contaPai: '83', aceitaLancamento: true },
    { codigo: '83.9', nome: 'Transfarência para resultados líquidos', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 3, contaPai: '83', aceitaLancamento: true },
    { codigo: '84', nome: 'Resultados financeiros em filiais e associadas', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 2, contaPai: '8', aceitaLancamento: false },
    { codigo: '84.1', nome: 'Proveitos e ganhos em filiais e associadas', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 3, contaPai: '84', aceitaLancamento: true },
    { codigo: '84.2', nome: 'Custos e perdas em filiais e associadas', tipo: 'CAPITAL', natureza: 'DEVEDORA', nivel: 3, contaPai: '84', aceitaLancamento: true },
    { codigo: '84.9', nome: 'Transfarência para resultados líquidos', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 3, contaPai: '84', aceitaLancamento: true },
    { codigo: '85', nome: 'Resultados não operacionais', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 2, contaPai: '8', aceitaLancamento: false },
    { codigo: '85.1', nome: 'Proveitos e ganhos não operacionais', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 3, contaPai: '85', aceitaLancamento: true },
    { codigo: '85.2', nome: 'Custos e perdas não operacionais', tipo: 'CAPITAL', natureza: 'DEVEDORA', nivel: 3, contaPai: '85', aceitaLancamento: true },
    { codigo: '85.9', nome: 'Transfarência para resultados líquidos', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 3, contaPai: '85', aceitaLancamento: true },
    { codigo: '86', nome: 'Resultados Extraordinários', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 2, contaPai: '8', aceitaLancamento: false },
    { codigo: '86.1', nome: 'Proveitos e ganhos extraordinários', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 3, contaPai: '86', aceitaLancamento: true },
    { codigo: '86.2', nome: 'Custos e perdas extraordinários', tipo: 'CAPITAL', natureza: 'DEVEDORA', nivel: 3, contaPai: '86', aceitaLancamento: true },
    { codigo: '86.9', nome: 'Transfarência para resultados líquidos', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 3, contaPai: '86', aceitaLancamento: true },
    { codigo: '87', nome: 'Impostos sobre os lucros', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 2, contaPai: '8', aceitaLancamento: false },
    { codigo: '87.1', nome: 'Imposto sobre os resultados correntes', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 3, contaPai: '87', aceitaLancamento: true },
    { codigo: '87.2', nome: 'Imposto sobre os resultados extraordinários', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 3, contaPai: '87', aceitaLancamento: true },
    { codigo: '87.9', nome: 'Transfarência para resultados líquidos', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 3, contaPai: '87', aceitaLancamento: true },
    { codigo: '88', nome: 'Resultados Líquidos do Exercício', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 2, contaPai: '8', aceitaLancamento: false },
    { codigo: '88.1', nome: 'Resultados operacionais', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 3, contaPai: '88', aceitaLancamento: true },
    { codigo: '88.2', nome: 'Resultados financeiros gerais', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 3, contaPai: '88', aceitaLancamento: true },
    { codigo: '88.3', nome: 'Resultados em filias e associadas', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 3, contaPai: '88', aceitaLancamento: true },
    { codigo: '88.4', nome: 'Resultados não operacionais', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 3, contaPai: '88', aceitaLancamento: true },
    { codigo: '88.5', nome: 'Impostos sobre os resultados correntes', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 3, contaPai: '88', aceitaLancamento: true },
    { codigo: '88.6', nome: 'Resultados extraordinários', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 3, contaPai: '88', aceitaLancamento: true },
    { codigo: '88.7', nome: 'Imposto sobre os resultados extraordinários', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 3, contaPai: '88', aceitaLancamento: true },
    { codigo: '88.9', nome: 'Transfarência para resultados transitados', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 3, contaPai: '88', aceitaLancamento: true },
    { codigo: '89', nome: 'Dividendos Antecipados', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 2, contaPai: '8', aceitaLancamento: false },
    { codigo: '89.9', nome: 'Transfência para resultados transitados', tipo: 'CAPITAL', natureza: 'CREDORA', nivel: 3, contaPai: '89', aceitaLancamento: true },
  ];

  // Ordena por nível
// 1. Ordenar por nível para garantir que os pais sejam processados antes ou na mesma leva
  const contasOrdenadas = contas.sort((a, b) => a.nivel - b.nivel);

  console.log(`   📝 Inserindo ${contasOrdenadas.length} contas...`);

  // PRIMEIRA PASSAGEM: Criar ou atualizar as contas SEM vincular o pai ainda
  // Isso evita o erro de Foreign Key porque o pai pode não ter sido criado com o ID final ainda
  for (const conta of contasOrdenadas) {
    // Removemos o campo 'contaPai' do objeto antes de enviar para o Prisma
    //const { contaPai, ...dadosConta } = conta as any;

    await prisma.contaContabil.upsert({
      where: { codigo: conta.codigo },
      update: { ...conta},
      create: {...conta, criadoporId:adminUser.id}
    });
  }

  console.log(`   🔗 Vinculando hierarquia do Plano de Contas...`);

  // SEGUNDA PASSAGEM: Agora que todas as contas existem no banco, vinculamos os IDs
  
console.log(`   ✅ Plano de Contas inserido com sucesso!`);
  
  // Estatísticas
  const totalContas = await prisma.contaContabil.count();
  const contasPorTipo = await prisma.contaContabil.groupBy({
    by: ['tipo'],
    _count: true,
  });
  
  console.log('\n📊 Estatísticas do Plano de Contas:');
  console.log(`   Total de contas: ${totalContas}`);
  contasPorTipo.forEach(item => {
    console.log(`   ${item.tipo}: ${item._count} contas`);
  });

  console.log('\n✨ Seed concluído com sucesso!');

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