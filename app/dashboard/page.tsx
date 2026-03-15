import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { Calculator, BookOpen, FileText, BarChart3, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // Estatísticas
  const totalContas = await prisma.contaContabil.count({ where: { ativa: true } });
  const totalLancamentos = await prisma.lancamentoContabil.count({ where: { status: "ATIVO" } });

  const cards = [
    {
      title: "Plano de Contas",
      description: "Gerencie a estrutura de contas contábeis",
      icon: BookOpen,
      href: "/dashboard/plano-contas",
      color: "from-blue-500 to-blue-600",
      stat: `${totalContas} contas`,
    },
    {
      title: "Lançamentos",
      description: "Registre operações contábeis diárias",
      icon: FileText,
      href: "/dashboard/lancamentos",
      color: "from-emerald-500 to-emerald-600",
      stat: `${totalLancamentos} lançamentos`,
    },
    {
      title: "Relatórios",
      description: "Consulte diário, balancete, DRE e balanço",
      icon: BarChart3,
      href: "/dashboard/relatorios",
      color: "from-amber-500 to-amber-600",
      stat: "5 relatórios",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Bem-vindo, {session?.user?.name}!
        </h1>
        <p className="text-muted-foreground">
          Sistema de informação contabilística
        </p>
      </div>

      {/* Cards de Navegação */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href}>
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-emerald-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`bg-gradient-to-br ${card.color} p-3 rounded-xl shadow-md`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <CardTitle className="mt-4">{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-emerald-600">
                      {card.stat}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="group-hover:bg-emerald-50 group-hover:text-emerald-700"
                    >
                      Acessar →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Informações do Sistema */}
      <Card className="bg-gradient-to-r from-emerald-50 to-amber-50 border-emerald-200">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-emerald-900">Sobre o Sistema</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-emerald-800">
          <p>
            • <strong>Plano de Contas:</strong> Baseado no Decreto n.º 82/01 (Plano Geral de Contabilidade de Angola)
          </p>
          <p>
            • <strong>Método:</strong> Partidas Dobradas (Débito = Crédito)
          </p>
          <p>
            • <strong>Relatórios:</strong> Diário, Razão, Balancete, DRE e Balanço Patrimonial
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
