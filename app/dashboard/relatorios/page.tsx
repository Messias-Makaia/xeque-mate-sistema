"use client";

import { useState } from "react";
import { BarChart3, FileText, Scale, TrendingUp, DollarSign, Calendar, Download, Calculator, Contact } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type RelatorioTipo = "diario" | "balancete" | "dre" | "balanco" | "razao";
type Conta = {id: string;codigo: string;nome: string;tipo: string;aceitaLancamento: boolean;};

export default function RelatoriosPage() {
  const [relatorioAtivo, setRelatorioAtivo] = useState<RelatorioTipo>("diario");
  const [dataInicio, setDataInicio] = useState(format(new Date(new Date().getFullYear(), 0, 1), "yyyy-MM-dd"));
  const [dataFim, setDataFim] = useState(format(new Date(), "yyyy-MM-dd"));
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState<any>(null);
  const[conta, setContas]=useState<Conta[]>([]);

  const relatorios = [
    {
      id: "diario" as RelatorioTipo,
      nome: "Diário",
      descricao: "Listagem cronológica de todos os lançamentos",
      icon: FileText,
      color: "from-blue-500 to-blue-600",
      usaPeriodo: true,
      usaconta: false,
    },
    {
      id: "balancete" as RelatorioTipo,
      nome: "Balancete",
      descricao: "Saldos de todas as contas contábeis",
      icon: Scale,
      color: "from-emerald-500 to-emerald-600",
      usaPeriodo: false,
      usaconta: false,
    },
    {
      id: "dre" as RelatorioTipo,
      nome: "DRE",
      descricao: "Demonstração do Resultado do Exercício",
      icon: TrendingUp,
      color: "from-blue-500 to-blue-600",
      usaPeriodo: true,
      usaconta: false,
    },
    {
      id: "balanco" as RelatorioTipo,
      nome: "Balanço Patrimonial",
      descricao: "Ativo, Passivo e Patrimônio Líquido",
      icon: DollarSign,
      color: "from-emerald-500 to-emerald-600",
      usaPeriodo: false,
      usaconta: false,
    },
    {
      id: "razao" as RelatorioTipo,
      nome: "Razão",
      descricao: "Ativo, Passivo e Patrimônio Líquido",
      icon: Calculator,
      color: "from-blue-500 to-blue-600",
      usaPeriodo: true,
      usaconta: true,
    },
  ];

  const carregarcontas = async () =>{
  try{
      const [contasResponse] = await Promise.all([
        fetch("/api/contas?ativas=true"),
      ]);
      const [contasData] = await Promise.all([
        contasResponse.json(),
      ]);
      setContas((contasData || []).filter((c: Conta) => c.aceitaLancamento));
  }
  catch (error) {
      console.error("Erro ao carregar dados:", error);
    } 
  };
   const plano = conta.map((cont)=>{
        const contaid = cont.id;
        const nome = cont.nome;
        const codigo = cont.codigo;
      });


  const relatorioSelecionado = relatorios.find((r) => r.id === relatorioAtivo);
  const [contaSelecionadaId,setContaSelecionadaId] = useState<string>("");
  const gerarRelatorio = async () => {
    setLoading(true);
    setDados(null);

    try {
      let url = "";
      
      if (relatorioAtivo === "diario") {
        url = `/api/relatorios/diario?dataInicio=${dataInicio}&dataFim=${dataFim}`;
      } else if (relatorioAtivo === "balancete") {
        url = `/api/relatorios/balancete?dataFim=${dataFim}`;
      } else if (relatorioAtivo === "dre") {
        url = `/api/relatorios/dre?dataInicio=${dataInicio}&dataFim=${dataFim}`;
      } else if (relatorioAtivo === "balanco") {
        url = `/api/relatorios/balanco?dataFim=${dataFim}`;
      }else if (relatorioAtivo === "razao") {
        url = `/api/relatorios/razao?dataInicio=${dataInicio}&dataFim=${dataFim}&conta=${contaSelecionadaId}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setDados(data);
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      alert("Erro ao gerar relatório");
    } finally {
      setLoading(false);
    }
  };

  const renderDiario = () => {
    if (!dados || !dados.lancamentos) return null;

    return (
      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          {dados.lancamentos.length === 0 ? (
            <div className="text-center py-8 text-slate-500">Nenhum lançamento no período</div>
          ) : (
            dados.lancamentos.map((lanc: any) => (
              <Card key={lanc.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">
                          {format(new Date(lanc.data), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                        {lanc.documento && <Badge variant="outline">Doc: {lanc.documento}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{lanc.descricao}</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      {parseFloat(lanc.totalDebito).toLocaleString("pt-AO")} Kz
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {lanc.itens.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm p-2 bg-slate-50 rounded">
                        <div className="flex items-center space-x-2">
                          <code className="text-xs font-mono bg-white px-2 py-1 rounded">
                            {item.codigoConta}
                          </code>
                          <span>{item.nomeConta}</span>
                        </div>
                        <div className="flex space-x-4 font-mono">
                          <span className="text-blue-600">D: {parseFloat(item.debito).toFixed(2)}</span>
                          <span className="text-red-600">C: {parseFloat(item.credito).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    );
  };

  const renderBalancete = () => {
    if (!dados || !dados.contas) return null;

    return (
      <div className="space-y-4">
        <ScrollArea className="h-[500px]">
          <div className="space-y-2">
            {dados.contas.map((conta: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100">
                <div className="flex items-center space-x-3 flex-1">
                  <code className="text-xs font-mono font-semibold bg-white px-2 py-1 rounded">
                    {conta.codigo}
                  </code>
                  <span className="font-medium">{conta.nome}</span>
                  <Badge variant="outline" className="text-xs">{conta.tipo}</Badge>
                </div>
                <div className="grid grid-cols-4 gap-4 font-mono text-sm text-right">
                  <span className="text-blue-600">{parseFloat(conta.debito).toFixed(2)}</span>
                  <span className="text-red-600">{parseFloat(conta.credito).toFixed(2)}</span>
                  <span className="text-green-600">{parseFloat(conta.saldoDevedor).toFixed(2)}</span>
                  <span className="text-orange-600">{parseFloat(conta.saldoCredor).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <Separator />

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-4">
            <div className="grid grid-cols-4 gap-4 font-mono">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Total Débito</div>
                <div className="text-lg font-bold text-blue-600">
                  {parseFloat(dados.totais.debito).toLocaleString("pt-AO", { minimumFractionDigits: 2 })} Kz
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Total Crédito</div>
                <div className="text-lg font-bold text-red-600">
                  {parseFloat(dados.totais.credito).toLocaleString("pt-AO", { minimumFractionDigits: 2 })} Kz
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Saldo Devedor</div>
                <div className="text-lg font-bold text-green-600">
                  {parseFloat(dados.totais.saldoDevedor).toLocaleString("pt-AO", { minimumFractionDigits: 2 })} Kz
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Saldo Credor</div>
                <div className="text-lg font-bold text-orange-600">
                  {parseFloat(dados.totais.saldoCredor).toLocaleString("pt-AO", { minimumFractionDigits: 2 })} Kz
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderDRE = () => {
    if (!dados) return null;

    const totalReceitas = parseFloat(dados.receitas?.total || "0");
    const totalCustos = parseFloat(dados.custos?.total || "0");
    const resultado = parseFloat(dados.resultadoLiquido || "0");

    return (
      <div className="space-y-6">
        {/* Receitas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-700">Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dados.receitas?.itens?.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between p-2 bg-green-50 rounded">
                  <div className="flex items-center space-x-2">
                    <code className="text-xs font-mono bg-white px-2 py-1 rounded">{item.codigo}</code>
                    <span>{item.nome}</span>
                  </div>
                  <span className="font-semibold text-green-700">
                    {parseFloat(item.valor).toLocaleString("pt-AO", { minimumFractionDigits: 2 })} Kz
                  </span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between items-center font-bold text-lg pt-2">
                <span>Total de Receitas</span>
                <span className="text-green-700">
                  {totalReceitas.toLocaleString("pt-AO", { minimumFractionDigits: 2 })} Kz
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-700">Custos e Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dados.custos?.itens?.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between p-2 bg-red-50 rounded">
                  <div className="flex items-center space-x-2">
                    <code className="text-xs font-mono bg-white px-2 py-1 rounded">{item.codigo}</code>
                    <span>{item.nome}</span>
                  </div>
                  <span className="font-semibold text-red-700">
                    ({parseFloat(item.valor).toLocaleString("pt-AO", { minimumFractionDigits: 2 })}) Kz
                  </span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between items-center font-bold text-lg pt-2">
                <span>Total de Custos</span>
                <span className="text-red-700">
                  ({totalCustos.toLocaleString("pt-AO", { minimumFractionDigits: 2 })}) Kz
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultado */}
        <Card className={resultado >= 0 ? "bg-emerald-50 border-emerald-300" : "bg-red-50 border-red-300"}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-lg font-semibold">Resultado Líquido do Exercício</div>
                <div className="text-sm text-muted-foreground">
                  {dados.tipo === "LUCRO" ? "Lucro" : "Prejuízo"}
                </div>
              </div>
              <div className={`text-3xl font-bold ${resultado >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                {resultado >= 0 ? "" : "("}
                {Math.abs(resultado).toLocaleString("pt-AO", { minimumFractionDigits: 2 })} Kz
                {resultado >= 0 ? "" : ")"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderBalanco = () => {
    if (!dados) return null;

    const totalAtivo = parseFloat(dados.ativo?.total || "0");
    const totalPassivo = parseFloat(dados.passivo?.total || "0");
    const totalCapital = parseFloat(dados.capital?.total || "0");
    const totalPassivoCapital = parseFloat(dados.totalPassivoCapital || "0");

    return (
      <div className="grid md:grid-cols-2 gap-6">
        {/* Ativo */}
        <Card className="border-2 border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-blue-700">ATIVO</CardTitle>
            <CardDescription>Bens e Direitos</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {dados.ativo?.itens?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between p-2 bg-blue-50 rounded">
                    <div className="flex items-center space-x-2">
                      <code className="text-xs font-mono bg-white px-2 py-1 rounded">{item.codigo}</code>
                      <span className="text-sm">{item.nome}</span>
                    </div>
                    <span className="font-semibold text-blue-700">
                      {parseFloat(item.valor).toLocaleString("pt-AO", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Separator className="my-4" />
            <div className="flex justify-between items-center font-bold text-xl">
              <span>Total do Ativo</span>
              <span className="text-blue-700">
                {totalAtivo.toLocaleString("pt-AO", { minimumFractionDigits: 2 })} Kz
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Passivo + Capital */}
        <div className="space-y-6">
          {/* Passivo */}
          <Card className="border-2 border-red-200">
            <CardHeader className="bg-red-50">
              <CardTitle className="text-red-700">PASSIVO</CardTitle>
              <CardDescription>Obrigações</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                {dados.passivo?.itens?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between p-2 bg-red-50 rounded">
                    <div className="flex items-center space-x-2">
                      <code className="text-xs font-mono bg-white px-2 py-1 rounded">{item.codigo}</code>
                      <span className="text-sm">{item.nome}</span>
                    </div>
                    <span className="font-semibold text-red-700">
                      {parseFloat(item.valor).toLocaleString("pt-AO", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-center font-bold">
                <span>Total Passivo</span>
                <span className="text-red-700">
                  {totalPassivo.toLocaleString("pt-AO", { minimumFractionDigits: 2 })} Kz
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Capital */}
          <Card className="border-2 border-emerald-200">
            <CardHeader className="bg-emerald-50">
              <CardTitle className="text-emerald-700">PATRIMÔNIO LÍQUIDO</CardTitle>
              <CardDescription>Capital e Reservas</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                {dados.capital?.itens?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between p-2 bg-emerald-50 rounded">
                    <div className="flex items-center space-x-2">
                      <code className="text-xs font-mono bg-white px-2 py-1 rounded">{item.codigo}</code>
                      <span className="text-sm">{item.nome}</span>
                    </div>
                    <span className="font-semibold text-emerald-700">
                      {parseFloat(item.valor).toLocaleString("pt-AO", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-center font-bold">
                <span>Total Capital</span>
                <span className="text-emerald-700">
                  {totalCapital.toLocaleString("pt-AO", { minimumFractionDigits: 2 })} Kz
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Total Passivo + Capital */}
          <Card className="bg-amber-50 border-2 border-amber-300">
            <CardContent className="pt-4">
              <div className="flex justify-between items-center font-bold text-xl">
                <span>Total Passivo + PL</span>
                <span className="text-amber-700">
                  {totalPassivoCapital.toLocaleString("pt-AO", { minimumFractionDigits: 2 })} Kz
                </span>
              </div>
              <div className="mt-2 text-sm text-center">
                {dados.equilibrio ? (
                  <Badge className="bg-green-100 text-green-800">Equação Patrimonial Correta ✓</Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800">Atenção: Valores não conferem</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

   const renderRazao = () => {
    if (!dados || !dados.razao1) return null;
    return (
      <div className="space-y-4">
        <ScrollArea className="h-[500px]">
          <div className="space-y-2">
            <table className="w-full text-sm text-left border-collapse">
                <thead className=" sticky top-0 bg-white shadow-sm z-10 bg-salte-50 text-slate-600 uppercase text-xs font-semibold">
                  <tr>
                    <th className="px-4 py-3 border-b">Data</th>
                    <th className="px-4 py-3 border-b">Descrição</th>
                    <th className="px-4 py-3 border-b">Débito</th>
                    <th className="px-4 py-3 border-b">Crédito</th>
                    <th className="px-4 py-3 border-b">Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                   {dados.razao1.map((conta: any, idx: number) => (
                    <tr key={idx} className="hover:bg_slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium">{format(new Date (conta.data), "dd/MM/yyyy",{locale:ptBR,})}</td>
                    <td className="px-4 py-3 font-mono font-medium">{conta.descricao}</td>
                    <td className="px-4 py-3 font-mono font-medium text-emerald-600">{parseFloat(conta.debito).toFixed(2)}</td>
                    <td className="px-4 py-3 font-mono font-medium text-red-600">{parseFloat(conta.credito).toFixed(2)}</td>
                    <td className="px-4 py-3 font-mono font-medium">{parseFloat(conta.saldo).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
        </ScrollArea>
        <Separator />
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-4">
            <div className="grid grid-cols-4 gap-4 font-mono">
              {/* <div>
                <div className="text-xs text-muted-foreground mb-1">Total Débito</div>
                <div className="text-lg font-bold text-blue-600">
                  {parseFloat(dados.totais.debito).toLocaleString("pt-AO", { minimumFractionDigits: 2 })} Kz
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Total Crédito</div>
                <div className="text-lg font-bold text-red-600">
                  {parseFloat(dados.totais.credito).toLocaleString("pt-AO", { minimumFractionDigits: 2 })} Kz
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Saldo Devedor</div>
                <div className="text-lg font-bold text-green-600">
                  {parseFloat(dados.totais.saldoDevedor).toLocaleString("pt-AO", { minimumFractionDigits: 2 })} Kz
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Saldo Credor</div>
                <div className="text-lg font-bold text-orange-600">
                  {parseFloat(dados.totais.saldoCredor).toLocaleString("pt-AO", { minimumFractionDigits: 2 })} Kz
                </div>
              </div> */}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
          <BarChart3 className="h-8 w-8 text-emerald-600" />
          <span>Relatórios Contábeis</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Consulte os principais relatórios da Xeque-Mate
        </p>
      </div>

      {/* Seleção de Relatório */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {relatorios.map((rel) => {
          const Icon = rel.icon;
          const isActive = relatorioAtivo === rel.id;
          return (
            <Card
              key={rel.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isActive ? "ring-2 ring-emerald-500 shadow-lg" : ""
              }`}
              onClick={() => {
                setRelatorioAtivo(rel.id);
                setDados(null);
                carregarcontas();
              }}
            >
              <CardHeader>
                <div className={`bg-gradient-to-br ${rel.color} p-3 rounded-xl shadow-md w-fit`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="mt-2">{rel.nome}</CardTitle>
                <CardDescription className="text-xs">{rel.descricao}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Parâmetros e Geração */}
      <Card>
        <CardHeader>
          <CardTitle>Parâmetros do Relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            {relatorioSelecionado?.usaPeriodo && (
              <div className="flex-1 space-y-2">
                <Label htmlFor="dataInicio">Data Início</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>
            )}
            <div className="flex-1 space-y-2">
              <Label htmlFor="dataFim">
                {relatorioSelecionado?.usaPeriodo ? "Data Fim" : "Data de Referência"}
              </Label>
              <Input
                id="dataFim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
            {relatorioSelecionado?.usaconta && (
              <div className="flex-1 space-y-2">
                <Label htmlFor="conta">Conta</Label>
                <Select value={contaSelecionadaId} onValueChange={setContaSelecionadaId}
                >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a conta" />
              </SelectTrigger>
              <SelectContent>
                {conta.map((cont) => (
                  <SelectItem key={cont.id} value={cont.id}>
                    {cont.codigo} - {cont.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
              </div>
            )}
            <Button
              onClick={gerarRelatorio}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? "Gerando..." : "Gerar Relatório"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      {dados && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>{relatorioSelecionado?.nome} Xeque-Mate</span>
                </CardTitle>
                <CardDescription>
                    <div className="py-2 font-medium text-blue-600">
                    {relatorioSelecionado?.usaconta 
                    ? `Conta: ${conta.find((c)=> c.id==contaSelecionadaId)?.codigo} - ${conta.find((c)=> c.id==contaSelecionadaId)?.nome}`: null}
                    </div>
                  <div className="font-medium">
                  {relatorioSelecionado?.usaPeriodo
                    ? `Período: ${format(new Date(dataInicio), "dd/MM/yyyy")} - ${format(new Date(dataFim), "dd/MM/yyyy")}`
                    : `Data: ${format(new Date(dataFim), "dd/MM/yyyy")}`}
                    </div>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {relatorioAtivo === "diario" && renderDiario()}
            {relatorioAtivo === "balancete" && renderBalancete()}
            {relatorioAtivo === "dre" && renderDRE()}
            {relatorioAtivo === "balanco" && renderBalanco()}
            {relatorioAtivo === "razao" && renderRazao()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
