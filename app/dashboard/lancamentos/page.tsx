"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  Plus,
  Calendar,
  Lock,
  AlertCircle,
  CheckCircle2,
  Edit,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ConteudoSidebar } from "./components/PeriodoSidebar";
import FormularioLancamento from "./components/FormularioLancamento";
import ExercicioHeader from "./components/ExercicioHeader";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

type StatusPeriodo = "ABERTO" | "FECHADO" | "REVISAO" | "AGUARDANDO";
const StatusPeriodo = {
  ABERTO: "ABERTO",
  FECHADO: "FECHADO",
  REVISAO: "REVISAO",
  AGUARDANDO: "AGUARDANDO",
};

type ItemLancamento = {
  id?: string;
  contaContabilId: string;
  codigoConta?: string;
  nomeConta?: string;
  debito: string;
  credito: string;
  historico?: string;
};

type CriadoPor = {
  id: string;
  nome: string;
};

type Lancamento = {
  id: string;
  data: string;
  descricao: string;
  documento?: string | null;
  tipo: string;
  totalDebito: string;
  totalCredito: string;
  status: string;
  observacoes?: string | null;
  itens: ItemLancamento[];
  periodoId: string;
  criadopor: CriadoPor;
  periodo: Periodo;
};

type Conta = {
  id: string;
  codigo: string;
  nome: string;
  tipo: string;
  aceitaLancamento: boolean;
};

type Periodo = {
  id: string;
  nome: string;
  dataInicio: string;
  dataFim: string;
  periodoIndex: number;
  bloqueado: boolean;
  criadoEm: string;
  exercicioId: string;
  status: StatusPeriodo;
  atualizadoporId: string;
}

type Exercicio = {
  id: string;
  nome: string;
  fechado: boolean;
  dataInicio: string;
  dataFim: string;
  criadoEm: string;
  criadoporId: string;
  atualizadoporId: string;
  periodos: Periodo[];
}

const estadoLancamentoInicial = {
  data: format(new Date(), "yyyy-MM-dd"),
  descricao: "",
  documento: "",
  tipo: "NORMAL",
  observacoes: "",
  periodoId: "",
};

export default function LancamentosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const exercicioIdUrl = searchParams.get("exercicioId");
  const periodoIdUrl = searchParams.get("periodoId");

  // Estado de Exercícios e Períodos
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [exercicioSelecionado, setExercicioSelecionado] = useState<Exercicio | null>(null);
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [periodoSelecionado, setPeriodoSelecionado] = useState<Periodo | null>(null);

  // Estado de Dados
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [lancamentosFiltro, setLancamentosFiltro] = useState<Lancamento[]>([]);
  const [contas, setContas] = useState<Conta[]>([]);
  const [loading, setLoading] = useState(true);
  const [lanId, setLanId] = useState("TODOS");

  // Estado de Dialogs
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [lancamentoEdit, setLancamentoEdit] = useState<Lancamento | null>(null);
  const [estornoDialogOpen, setEstornoDialogOpen] = useState(false);
  const [lancamentoEstorno, setLancamentoEstorno] = useState<Lancamento | null>(null);

  // Estado de Lançamento
  const [novoLancamento, setNovoLancamento] = useState(estadoLancamentoInicial);
  const [itens, setItens] = useState<ItemLancamento[]>([
    { contaContabilId: "", codigoConta: "", debito: "0", credito: "0" },
    { contaContabilId: "", codigoConta: "", debito: "0", credito: "0" },
  ]);

  //toast
  const { toast } = useToast();

  // ============ CARREGAR DADOS INICIAIS ============
  useEffect(() => {
    carregarExercicios();
    carregarContas();
  }, []);

  // ============ SINCRONIZAR COM URL ============
  useEffect(() => {
    if (exercicioIdUrl && exercicios.length > 0) {
      const exer = exercicios.find((e) => e.id === exercicioIdUrl);
      if (exer) {
        setExercicioSelecionado(exer);
        setPeriodos((exer.periodos || []).sort((a, b) => a.periodoIndex - b.periodoIndex));

        if (periodoIdUrl) {
          const per = (exer.periodos || []).find((p) => p.id === periodoIdUrl);
          if (per) {
            setPeriodoSelecionado(per);
          }
        } else {
          setPeriodoSelecionado(null);
        }
      }
    }
  }, [exercicioIdUrl, periodoIdUrl, exercicios]);

  // ============ CARREGAR LANÇAMENTOS ============
  useEffect(() => {
    if (exercicioSelecionado) {
      carregarLancamentos();
    }
  }, [exercicioSelecionado, periodoSelecionado]);

  useEffect(() => {
    filtrarLancamentos();
  }, [lancamentos, periodoSelecionado, lanId]);


  const carregarExercicios = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/exercicios");
      const data = await res.json();
      const exerciciosArray = (data.exercicios || []).sort(
        (a: Exercicio, b: Exercicio) =>
          new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime()
      );
      setExercicios(exerciciosArray);

      if (exerciciosArray.length > 0 && !exercicioIdUrl) {
        const primeiroExercicio = exerciciosArray[0];
        router.push(`?exercicioId=${primeiroExercicio.id}`);
      }
    } catch (error) {
      console.error("Erro ao carregar exercícios:", error);
    } finally {
      setLoading(false);
    }
  };

  const carregarContas = async () => {
    try {
      const res = await fetch("/api/contas?ativas=true");
      const data = await res.json();
      setContas((data || []).filter((c: Conta) => c.aceitaLancamento));
    } catch (error) {
      console.error("Erro ao carregar contas:", error);
    }
  };

  const carregarLancamentos = async () => {
    if (!exercicioSelecionado) return;

    setLoading(true);
    try {
      const url = new URL("/api/lancamentos", window.location.origin);
      url.searchParams.append("exercicioId", exercicioSelecionado.id);
      if (periodoSelecionado) {
        url.searchParams.append("periodoId", periodoSelecionado.id);
      }

      const res = await fetch(url.toString());
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "Erro",
          variant: "destructive",
          description: data.message || "Erro ao carregar lançamentos",
        })
      } else {
        setLancamentos(data || []);
      }
    } catch (error) {
      console.error("Erro ao carregar lançamentos:", error);
      toast({
        title: "Erro",
        variant: "destructive",
        description: "Erro ao carregar lançamentos",
      })
    } finally {
      setLoading(false);
    }
  };

  const handleSelecionarExercicio = (exercicio: Exercicio) => {
    setExercicioSelecionado(exercicio);
    setPeriodos((exercicio.periodos || []).sort((a, b) => a.periodoIndex - b.periodoIndex));
    setPeriodoSelecionado(null);
    router.push(`?exercicioId=${exercicio.id}`);
  };

  const filtrarLancamentos = () => {
    let resultados = [...lancamentos];
    if (periodoSelecionado) 
    {router.push(`?exercicioId=${exercicioSelecionado?.id}&periodoId=${periodoSelecionado.id}`);}
    if(lanId!=="TODOS")
    {resultados = lancamentos.filter((l) => l.periodoId === lanId);
    setLancamentosFiltro(resultados);}
    else{
      setLancamentosFiltro(resultados);
    }
  };



  const periodoFechado = periodoSelecionado?.status == StatusPeriodo.FECHADO || exercicioSelecionado?.fechado;

  // ============ HANDLERS DE LANÇAMENTO ============
  const calcularTotais = () => {
    const totalDebito = itens.reduce((acc, item) => acc + parseFloat(item.debito || "0"), 0);
    const totalCredito = itens.reduce((acc, item) => acc + parseFloat(item.credito || "0"), 0);
    return { totalDebito, totalCredito, diferenca: totalDebito - totalCredito };
  };

  const adicionarItem = () => {
    setItens([...itens, { contaContabilId: "", debito: "0", credito: "0" }]);
  };

  const removerItem = (index: number) => {
    if (itens.length > 2) {
      setItens(itens.filter((_, i) => i !== index));
    }
  };

  const atualizarItem = (index: number, campo: keyof ItemLancamento, valor: string) => {
    setItens((prevItens) => {
      const novosItens = [...prevItens];
      novosItens[index] = {
        ...novosItens[index],
        [campo]: valor,
      };
      return novosItens;
    });
  };

  const handleCriarLancamento = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!novoLancamento.periodoId) {
      toast({
        title: "Erro",
        variant: "destructive",
        description: "Selecione um período contábil.",
      });
      return;
    }

    const { totalDebito, totalCredito, diferenca } = calcularTotais();

    if (Math.abs(diferenca) > 0.01) {
      toast({
        title: "Erro",
        variant: "destructive",
        description: "Partidas dobradas inválidas! Débito deve ser igual ao Crédito.",
      });
      return;
    }

    if (totalDebito === 0 || totalCredito === 0) {
      toast({
        title: "Erro",
        variant: "destructive",
        description: "O lançamento deve ter valores de débito e crédito.",
      });
      return;
    }

    const itensValidos = itens.filter(
      (item) => item.contaContabilId && (parseFloat(item.debito) > 0 || parseFloat(item.credito) > 0)
    );

    if (itensValidos.length < 2) {
      toast({
        title: "Erro",
        variant: "destructive",
        description: "O lançamento deve ter pelo menos 2 itens.",
      });
      return;
    }

    try {
      const response = await fetch("/api/lancamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...novoLancamento,
          exercicioId: exercicioSelecionado?.id,
          itens: itensValidos,
        }),
      });

      if (response.ok) {
        await carregarLancamentos();
        setDialogOpen(false);
        setNovoLancamento(estadoLancamentoInicial);
        setItens([
          { contaContabilId: "", debito: "0", credito: "0" },
          { contaContabilId: "", debito: "0", credito: "0" },
        ]);
        toast({
          title: "Sucesso",
          variant: "success",
          description: "Lançamento criado com sucesso",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Erro",
          variant: "destructive",
          description: error.message || "Erro ao criar lançamento",
        });
      }
    } catch (error) {
      console.error("Erro ao criar lançamento:", error);
      toast({
        title: "Erro",
        variant: "destructive",
        description: "Erro ao criar lançamento",
      });
    }
  };

  const abrirEdicao = (lancamento: Lancamento) => {
    setLancamentoEdit(lancamento);
    setNovoLancamento({
      data: format(new Date(lancamento.data), "yyyy-MM-dd"),
      descricao: lancamento.descricao,
      documento: lancamento.documento || "",
      tipo: lancamento.tipo,
      observacoes: lancamento.observacoes || "",
      periodoId: lancamento.periodoId,
    });
    setItens(
      lancamento.itens.map((item) => ({
        ...item,
        contaContabilId: item.contaContabilId || "",
        debito: item.debito,
        credito: item.credito,
      }))
    );
    setEditDialogOpen(true);
  };

  const handleEditarLancamento = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lancamentoEdit) return;

    const { totalDebito, totalCredito, diferenca } = calcularTotais();

    if (Math.abs(diferenca) > 0.01) {
      alert("Partidas dobradas inválidas! Débito deve ser igual ao Crédito.");
      return;
    }

    const itensValidos = itens.filter(
      (item) => item.contaContabilId && (parseFloat(item.debito) > 0 || parseFloat(item.credito) > 0)
    );

    if (itensValidos.length < 2) {
      alert("O lançamento deve ter pelo menos 2 itens.");
      return;
    }

    try {
      const response = await fetch(`/api/lancamentos/${lancamentoEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...novoLancamento,
          itens: itensValidos,
        }),
      });

      if (response.ok) {
        await carregarLancamentos();
        setEditDialogOpen(false);
        setLancamentoEdit(null);
        setNovoLancamento(estadoLancamentoInicial);
        setItens([
          { contaContabilId: "", debito: "0", credito: "0" },
          { contaContabilId: "", debito: "0", credito: "0" },
        ]);
        alert("Lançamento editado com sucesso!");
      } else {
        const error = await response.json();
        alert(error.message || "Erro ao editar lançamento");
      }
    } catch (error) {
      console.error("Erro ao editar lançamento:", error);
      alert("Erro ao editar lançamento");
    }
  };

  const confirmarEstorno = (lancamento: Lancamento) => {
    setLancamentoEstorno(lancamento);
    setEstornoDialogOpen(true);
  };

  const handleEstornar = async () => {
    if (!lancamentoEstorno) return;

    try {
      const response = await fetch(`/api/lancamentos/${lancamentoEstorno.id}/estornar`, {
        method: "POST",
      });

      if (response.ok) {
        await carregarLancamentos();
        setEstornoDialogOpen(false);
        setLancamentoEstorno(null);
        alert("Lançamento estornado com sucesso!");
      } else {
        const error = await response.json();
        alert(error.message || "Erro ao estornar lançamento");
      }
    } catch (error) {
      console.error("Erro ao estornar lançamento:", error);
      alert("Erro ao estornar lançamento");
    }
  };

  const { totalDebito, totalCredito, diferenca } = calcularTotais();
  const partidasValidas = Math.abs(diferenca) < 0.01 && totalDebito > 0;

  return (
    <div className="space-y-6">
      {/* Header com Seletor de Exercício */}
      <ExercicioHeader
        exercicios={exercicios}
        exercicioSelecionado={exercicioSelecionado}
        onSelecionarExercicio={handleSelecionarExercicio}
      />

      {/* Alert de Período Fechado */}
      {periodoFechado && (
        <div className="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-900">Visualizando período encerrado</h3>
            <p className="text-sm text-amber-800">
              Edição de lançamentos está bloqueada. Apenas visualização permitida.
            </p>
          </div>
        </div>
      )}

      {/* Grid: Sidebar + Conteúdo */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar de Períodos */}

        <aside className="hidden md:flex w-64 shrink-0 bg-sidebar h-full flex-col border-r border-border">
          <ConteudoSidebar
            periodos={periodos}
            setPeriodo={setPeriodoSelecionado}
            periodo={periodoSelecionado}
            periodoId={lanId}
            setPeriodoId={setLanId}
          />
        </aside>

        {/* Conteúdo Principal */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between sm:flex flex-col space-y-2 left-0">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
                <FileText className="h-8 w-8 text-emerald-600" />
                <span>Lançamentos Contábeis</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                {periodoSelecionado
                  ? `Período: ${periodoSelecionado.nome} (Mês ${periodoSelecionado.periodoIndex})`
                  : `Exercício: ${exercicioSelecionado?.nome || "Nenhum exercício selecionado"}`}
              </p>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild className="">
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  title="Criar novo lançamento"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Lançamento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Novo Lançamento Contábil</DialogTitle>
                  <DialogDescription>
                    Preencha os dados do lançamento seguindo o método das partidas dobradas
                  </DialogDescription>
                </DialogHeader>
                <FormularioLancamento
                  novoLancamento={novoLancamento}
                  setNovoLancamento={setNovoLancamento}
                  itens={itens}
                  setItens={setItens}
                  contas={contas}
                  periodos={periodos}
                  adicionarItem={adicionarItem}
                  removerItem={removerItem}
                  atualizarItem={atualizarItem}
                  calcularTotais={calcularTotais}
                  onSubmit={handleCriarLancamento}
                  isEditing={false}
                  onCancel={() => setDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Card de Lançamentos */}
          <Card>
            <CardHeader>
              <CardTitle>Lançamentos</CardTitle>
              <CardDescription>{lancamentosFiltro.length} lançamento(s) encontrados</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-slate-500">Carregando...</div>
              ) : lancamentosFiltro.length === 0 ? (
                <div className="text-center py-8 text-slate-500">Nenhum lançamento encontrado</div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4 pr-4">
                    {lancamentosFiltro.map((lancamento) => (
                      <Card key={lancamento.id} className="border-l-4 border-l-emerald-500">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between sm: flex flex-col">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center space-x-2 flex-wrap gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold">
                                  {format(new Date(lancamento.data), "dd/MM/yyyy", {
                                    locale: ptBR,
                                  })}
                                </span>
                                {lancamento.documento && (
                                  <Badge variant="outline">Doc: {lancamento.documento}</Badge>
                                )}
                                <Badge variant="outline">{lancamento.periodo.nome}</Badge>
                                <Badge
                                  variant={
                                    lancamento.status === "ATIVO"
                                      ? "default"
                                      : lancamento.status === "ESTORNADO"
                                        ? "destructive"
                                        : "secondary"
                                  }
                                >
                                  {lancamento.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{lancamento.descricao}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className="bg-emerald-100 text-emerald-800">
                                {parseFloat(lancamento.totalDebito).toFixed(2)} Kz
                              </Badge>
                              {lancamento.status === "ATIVO" && lancamento.tipo !== "ESTORNO" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => abrirEdicao(lancamento)}
                                    disabled={periodoFechado}
                                    className="text-blue-600 hover:bg-blue-50"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => confirmarEstorno(lancamento)}
                                    disabled={periodoFechado}
                                    className="text-orange-600 hover:bg-orange-50"
                                  >
                                    <RotateCcw className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {lancamento.itens.map((item, idx) => (
                              <div
                                key={item.id || idx}
                                className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded"
                              >
                                <div className="flex items-center space-x-2">
                                  <code className="text-xs font-mono bg-white px-2 py-1 rounded">
                                    {item.codigoConta}
                                  </code>
                                  <span>{item.nomeConta}</span>
                                </div>
                                <div className="flex space-x-4 font-mono text-sm">
                                  <span className="text-blue-600">
                                    D: {parseFloat(item.debito).toFixed(2)}
                                  </span>
                                  <span className="text-red-600">
                                    C: {parseFloat(item.credito).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog de Edição */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Lançamento Contábil</DialogTitle>
            <DialogDescription>Modifique os dados do lançamento</DialogDescription>
          </DialogHeader>
          <FormularioLancamento
            novoLancamento={novoLancamento}
            setNovoLancamento={setNovoLancamento}
            itens={itens}
            setItens={setItens}
            contas={contas}
            periodos={periodos}
            adicionarItem={adicionarItem}
            removerItem={removerItem}
            atualizarItem={atualizarItem}
            calcularTotais={calcularTotais}
            onSubmit={handleEditarLancamento}
            isEditing={true}
            onCancel={() => setEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* AlertDialog de Estorno */}
      <AlertDialog open={estornoDialogOpen} onOpenChange={setEstornoDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Estorno</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja estornar este lançamento? Esta ação criará um lançamento de
              estorno com valores invertidos.
              {lancamentoEstorno && (
                <div className="mt-4 p-3 bg-slate-100 rounded">
                  <p className="font-semibold">{lancamentoEstorno.descricao}</p>
                  <p className="text-sm">Valor: {parseFloat(lancamentoEstorno.totalDebito).toFixed(2)} Kz</p>
                  <p className="text-sm">
                    Data: {format(new Date(lancamentoEstorno.data), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEstornar}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Confirmar Estorno
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- SIDEBAR MOBILE --- */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet>
          <SheetTrigger asChild className="right">
            <Button variant="outline" size="icon">
              <Calendar className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <ConteudoSidebar
               periodos={periodos}
            setPeriodo={setPeriodoSelecionado}
            periodo={periodoSelecionado}
            periodoId={lanId}
            setPeriodoId={setLanId}
            />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}