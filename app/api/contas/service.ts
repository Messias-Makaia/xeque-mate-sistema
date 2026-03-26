import { PrismaClient, Prisma } from "@prisma/client";
const prisma = new PrismaClient();

export type ContaInput = {
  codigo: string;
  nome: string;
  descricao?: string | null;
  tipo: string;
  natureza: string;
  contaPai?: string | null;
  aceitaLancamento?: boolean;
  nivel: number;
};

const codigoRegex = /^[1-9]{2}(\.[1-9]){0,3}$/;

const contarNivel = (codigo: string) => codigo.split(".").length+1;

export async function validarConta(input: ContaInput) {
  const { codigo, nome, contaPai, aceitaLancamento = true } = input;

  if (!codigo || !nome) {
    throw new Error(
      "Campos obrigatórios faltando: código/nome",
    );
  }

  if (!codigoRegex.test(codigo)) {
    throw new Error("Código inválido. Formato esperado: 11, 11.1, 11.1.1");
  }

  const contaExistente = await prisma.contaContabil.findUnique({
    where: { codigo },
  });
  if (contaExistente) {
    throw new Error(`Código já existe: ${codigo}`);
  }

  let nivelCalculado = contarNivel(codigo);

  if (contaPai) {
    const pai = await prisma.contaContabil.findUnique({
      where: { codigo: contaPai},
    });
    if (!pai) {
      throw new Error("Conta pai inexistente.");
    }

    if (pai.aceitaLancamento) {
      throw new Error("Conta pai analítica não pode ter filhos.");
    }

    if(pai.nivel==1)
    {
        const paiRegex = new RegExp(`^${pai.codigo}[1-9]$`);
        if (!paiRegex.test(codigo)) {
            throw new Error(`Conta filha não inicia com o prefixo do pai (${pai.codigo}).`);
        }
        nivelCalculado=2;

    }else if (!codigo.startsWith(`${pai.codigo}.`)) {
      throw new Error(`Conta filha não inicia com prefixo do pai (${pai.codigo}).`);
    }

    const nivelPai = pai.nivel ?? contarNivel(pai.codigo);
    if (nivelCalculado !== nivelPai + 1) {
      throw new Error(
        `Nível inválido. Esperado ${nivelPai + 1} para filho de ${pai.codigo}, encontrou ${nivelCalculado}.`
      );
    }

    if (input.tipo && input.tipo !== pai.tipo) {
      throw new Error("Tipo da conta filha deve ser igual ao tipo da conta pai.");
    }

    input.tipo = pai.tipo;
    input.natureza = input.natureza || pai.natureza;

  } else {
    if (nivelCalculado !== 1) {
      throw new Error("A nova conta deve ter uma conta pai.");
    }
    if (!input.tipo) {
      throw new Error("Tipo obrigatório para conta raiz.");
    }
    if (!input.natureza) {
      throw new Error("Natureza obrigatória para conta raiz.");
    }
  }

  input.nivel = nivelCalculado;
  input.aceitaLancamento = aceitaLancamento;

  return input;
}

export async function criarConta(input: ContaInput, userId: string) {
  const valido = await validarConta(input);
  return prisma.contaContabil.create({
    data: {
      codigo: valido.codigo,
      nome: valido.nome,
      descricao: valido.descricao || null,
      tipo: valido.tipo,
      natureza: valido.natureza,
      contaPai: input.contaPai?? null,
      nivel: valido.nivel,
      aceitaLancamento: valido.aceitaLancamento,
      ativa: true,
      criadoporId: userId,
    },
  });
}

export async function obterArvoreContas() {
  const contas = await prisma.contaContabil.findMany({
    orderBy: [{ codigo: "asc" }],
  });

  const map = new Map<string, any>();
  contas.forEach((c) => map.set(c.id, { ...c, filhos: [] }));

  const raiz: any[] = [];
  contas.forEach((c) => {
    if (c.contaPaiId) {
      const pai = map.get(c.contaPaiId);
      if (pai) pai.filhos.push(map.get(c.id));
    } else {
      raiz.push(map.get(c.id));
    }
  });

  return raiz;
}

export async function obterDescendentes(contaId: string) {
  const pai = await prisma.contaContabil.findUnique({ where: { id: contaId } });
  if (!pai) throw new Error("Conta não encontrada.");
  const prefix = `${pai.codigo}.`;
  return prisma.contaContabil.findMany({
    where: { codigo: { startsWith: prefix } },
    orderBy: [{ codigo: "asc" }],
  });
}

export async function obterCaminho(contaId: string) {
  const conta = await prisma.contaContabil.findUnique({ where: { id: contaId } });
  if (!conta) throw new Error("Conta não encontrada.");

  const partes = conta.codigo.split(".");
  let prefixo = "";
  const caminho: any[] = [];

  for (const parte of partes) {
    prefixo = prefixo ? `${prefixo}.${parte}` : parte;
    const p = await prisma.contaContabil.findUnique({ where: { codigo: prefixo } });
    if (p) caminho.push(p);
  }

  return caminho;
}