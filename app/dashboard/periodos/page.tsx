"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Plus,
  Lock,
  Unlock,
  Trash2,
  Edit,
  AlertCircle,
  CheckCircle2,
  CalendarDays,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { usePermission } from "@/hooks/usePermission";
import { StatusPeriodo } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
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

type NovoExercicio = {
  nomeProximoExercicio: string;
  data: Date;
  exercicioId: string;
}
const estadoInicial = {
  nome: "",
  dataInicio: "",
};

export default function PeriodosPage() {
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [exercicio, setExercicio] = useState<Exercicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toggleDialogOpen, setToggleDialogOpen] = useState(false);
  const [periodoSelecionado, setPeriodoSelecionado] = useState<Periodo | null>(null);
  const [exercicioSelecionado, setExercicioSelecionado] = useState<Exercicio | null>(null);
  const [form, setForm] = useState(estadoInicial);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [podeCriar, setPodeCriar] = useState(false);
  const [encerrar, setEncerrar] = useState(false);
  const [exerciciosAbertos, setExerciciosAbertos] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/exercicios");
      if (res.ok) {
        const data = await res.json();
        setExercicio(data.exercicios || []);
        setPeriodos(data.exercicios.flatMap((ex: Exercicio) => ex.periodos) || []);
        setPodeCriar(data.podeCriar);
      } else {
        const data = await res.json();
        toast({
          title: "Erro",
          variant: "destructive",
          description: data.message || "Erro ao carregar dados. Tente novamente.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        variant: "destructive",
        description: "Erro ao carregar dados. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const exerciciosAgrupados = useMemo(() => {
    const exercicios = exercicio
      .sort(
        (a, b) =>
          new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime()
      );

    const mesesPorExercicios = periodos
      .reduce<Record<string, Periodo[]>>((acc, month) => {
        if (!month.exercicioId) return acc;
        if (!acc[month.exercicioId]) acc[month.exercicioId] = [];
        acc[month.exercicioId].push(month);
        return acc;
      }, {});

    return exercicios.map((exercicio) => ({
      ...exercicio,
      periodos: (mesesPorExercicios[exercicio.id] || []).sort((a, b) => {
        const ai = a.periodoIndex ?? 0;
        const bi = b.periodoIndex ?? 0;
        return ai - bi;
      }),
    }));
  }, [periodos]);

  const periodosFiltrados = exercicio.find((ex) => ex.fechado === false)?.periodos;
  const periodoAtual = periodosFiltrados?.find((p) => p.status === StatusPeriodo.ABERTO || p.status === StatusPeriodo.REVISAO);
  const totalEmEspera = periodosFiltrados?.filter((p) => p.status === StatusPeriodo.AGUARDANDO).length || 0;
  const totalFechados = periodosFiltrados?.filter((p) => p.status === StatusPeriodo.FECHADO).length || 0;

  const toggleExercicio = (exercicioId: string) => {
    setExerciciosAbertos((prev) =>
      prev.includes(exercicioId)
        ? prev.filter((id) => id !== exercicioId)
        : [...prev, exercicioId]
    );
  };
  const fecharDialogs = () => {
    setDialogOpen(false);
    setEditDialogOpen(false);
    setForm(estadoInicial);
    setErro("");
    setPeriodoSelecionado(null);
    setExercicioSelecionado(null);
  };
  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    try {
      const url = editDialogOpen
        ? `/api/exercicios/${exercicioSelecionado?.id}/editar`
        : "/api/exercicios";
      const method = editDialogOpen ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.message || "Erro ao salvar exercício.");
      }
      else {
        await carregarDados();
        fecharDialogs();
        toast({
          title: editDialogOpen ? "Exercício Atualizado" : "Exercício Criado",
          variant: "success",
          description: editDialogOpen ? "Exercício atualizado com sucesso."
            : "Exercício criado com sucesso.",
        });
      }

    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  const handleToggleFechado = async (e: React.FormEvent) => {
    if (!periodoSelecionado) return;
    setSalvando(true);
    e.preventDefault();
    try {
      const res = await fetch(`/api/periodos/${periodoSelecionado.id}/fechar`, {
        method: "PUT"
      });

      if (res.ok) {
        await carregarDados();
        setPeriodoSelecionado(null);
        setToggleDialogOpen(false);
        toast({
          title: "Sucesso!",
          variant: "success",
          description: "O período foi fechado corretamente.",
        })
      } else {
        const data = await res.json();
        toast({
          title: "Erro!",
          variant: "destructive",
          description: data.message || "Ocorreu um erro inesperado",
        });
      }
    } catch {
      toast({
        title: "Erro!",
        variant: "destructive",
        description: "Ocorreu um erro inesperado. Tente Novamente",
      });
    } finally {
      setSalvando(false);
    }

  };

  const handleApagar = async () => {
    if (!exercicioSelecionado) return;
    setSalvando(true);
    try {
      const res = await fetch(`/api/exercicio/${exercicioSelecionado.id}/deletar`, {
        method: "DELETE",
      });
      if (res.ok) {
        await carregarDados();
        setDeleteDialogOpen(false);
        setPeriodoSelecionado(null);
        setExercicioSelecionado(null);
        toast({
          title: "Exercício Apagado",
          variant: "success",
          description: "Exercício apagado com sucesso.",
        });
      } else {
        const data = await res.json();
        toast({
          title: "Exercício Apagado",
          variant: "destructive",
          description: data.message || "Erro ao apagar exercício.",
        });
      }
    } catch {
      toast({
        title: "Erro!",
        variant: "destructive",
        description: "Ocorreu um erro inesperado. Tente Novamente",
      });
    } finally {
      setSalvando(false);
    }
  };

  const abrirEdicao = (exercicio: Exercicio) => {
    setExercicioSelecionado(exercicio);
    setForm({
      nome: exercicio.nome,
      dataInicio: format(new Date(exercicio.dataInicio), "yyyy-MM-dd"),
    });
    setErro("");
    setEditDialogOpen(true);
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
            <CalendarDays className="h-8 w-8 text-emerald-600" />
            <span>Períodos Contabilísticos</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os exercícios e meses contabilísticos do sistema
          </p>
        </div>

        {podeCriar && (
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              if (!open) fecharDialogs();
              else setDialogOpen(true);
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Primeiro Exercício
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Primeiro Exercício Económico</DialogTitle>
                <DialogDescription>
                  Crie o primeiro Exercício da Empresa
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSalvar} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    placeholder="Ex: Exercício 2026/2027"
                    required
                  />
                </div>
                {!editDialogOpen && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dataInicio">Data de Início *</Label>
                      <Input
                        id="dataInicio"
                        type="date"
                        value={form.dataInicio}
                        onChange={(e) => setForm({ ...form, dataInicio: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                )}
                {erro && (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{erro}</span>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-2 border-t">
                  <Button type="button" variant="outline" onClick={fecharDialogs}>
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    disabled={salvando}
                  >
                    {salvando
                      ? "A salvar..."
                      : editDialogOpen
                        ? "Guardar Alterações"
                        : "Criar Exercício"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>


      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Periodo Atual</p>
                {periodoAtual ? (
                  <p className="text-3xl font-bold text-emerald-600">{periodoAtual.nome}</p>) :
                  (<p className="text-muted-foreground mt-1">
                    Nenhum período aberto.
                  </p>)
                }
                {periodoAtual && (
                  <Badge
                    className={
                      periodoAtual?.status === StatusPeriodo.REVISAO
                        ? "bg-orange-100 text-slate-700"
                        : "bg-emerald-100 text-emerald-700"
                    }
                  >
                    {periodoAtual?.status === StatusPeriodo.REVISAO ? "Em Revisão" : "Aberto"}
                  </Badge>)}
              </div>
              <Calendar className="h-10 w-10 text-emerald-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Periodos Em Espera</p>
                <p className="text-3xl font-bold text-blue-600">{totalEmEspera}</p>
              </div>
              <Unlock className="h-10 w-10 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-slate-400">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Períodos Fechados</p>
                <p className="text-3xl font-bold text-slate-600">{totalFechados}</p>
              </div>
              <Lock className="h-10 w-10 text-slate-400 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-emerald-600" />
            <span>Exercícios Económicos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">A carregar...</div>
          ) : exerciciosAgrupados.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum exercício criado ainda.</p>
              <p className="text-sm">Clique em "Primeiro Exercício" para começar.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {exerciciosAgrupados.map((ex) => (
                <div
                  key={ex.id}
                  className="border rounded-lg bg-white shadow-sm"
                >
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold">{ex.nome}</span>
                        <Badge
                          className={
                            ex.fechado
                              ? "bg-slate-100 text-slate-700"
                              : "bg-emerald-100 text-emerald-700"
                          }
                        >
                          {ex.fechado ? "Fechado" : "Aberto"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(ex.dataInicio), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}{" "}
                        →{" "}
                        {format(new Date(ex.dataFim), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleExercicio(ex.id)}
                      >
                        {exerciciosAbertos.includes(ex.id) ? "Ocultar meses" : "Ver meses"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => abrirEdicao(ex)}
                        className="text-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setExercicioSelecionado(ex);
                          setDeleteDialogOpen(true);
                        }}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {exerciciosAbertos.includes(ex.id) && (
                    <div className="border-t border-slate-200 bg-slate-50/60 p-3 space-y-3">
                      {(ex.periodos ?? []).length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Nenhum mês vinculado ao exercício.
                        </p>
                      ) : (
                        ex.periodos.map((mes) => (
                          <div
                            key={mes.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-white shadow-sm"
                          >
                            <div className="ml-4">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{mes.nome}</span>
                                <Badge
                                  className={
                                    mes.status === StatusPeriodo.FECHADO
                                      ? "bg-slate-100 text-slate-600"
                                      : mes.status === StatusPeriodo.ABERTO ?
                                        "bg-emerald-100 text-emerald-700" :
                                        mes.status === StatusPeriodo.REVISAO ?
                                          "bg-orange-100 text-orange-700" :
                                          "bg-yellow-100 text-yellow-700"
                                  }
                                >
                                  {mes.status === StatusPeriodo.FECHADO ? "Fechado" :
                                    mes.status === StatusPeriodo.REVISAO ? "Em Revisão" :
                                      mes.status === StatusPeriodo.ABERTO ? "Aberto" : "Aguardando"}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(mes.dataInicio), "dd/MM/yyyy", {
                                  locale: ptBR,
                                })}{" "}
                                →{" "}
                                {format(new Date(mes.dataFim), "dd/MM/yyyy", {
                                  locale: ptBR,
                                })}
                              </p>
                            </div>

                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setPeriodoSelecionado(mes);
                                  setToggleDialogOpen(true);
                                }}
                                className={
                                  mes.status === StatusPeriodo.FECHADO
                                    ? "text-emerald-600 hover:bg-emerald-50"
                                    : "text-slate-600 hover:bg-slate-100"
                                }
                                disabled={mes.status === StatusPeriodo.AGUARDANDO}
                              >
                                {mes.status === StatusPeriodo.FECHADO ? (
                                  <Unlock className="h-4 w-4" />
                                ) : (
                                  <Lock className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        if (!open) fecharDialogs();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Período</DialogTitle>
            <DialogDescription>
              Altere os dados do período contabilístico
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSalvar} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Ex: Exercício 2026/2027"
                required
              />
            </div>
            {!editDialogOpen && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dataInicio">Data de Início *</Label>
                  <Input
                    id="dataInicio"
                    type="date"
                    value={form.dataInicio}
                    onChange={(e) => setForm({ ...form, dataInicio: e.target.value })}
                    required
                  />
                </div>
              </div>

            )}
            {erro && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{erro}</span>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2 border-t">
              <Button type="button" variant="outline" onClick={fecharDialogs}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={salvando}
              >
                {salvando
                  ? "A salvar..."
                  : editDialogOpen
                    ? "Guardar Alterações"
                    : "Criar Período"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={toggleDialogOpen} onOpenChange={setToggleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {periodoSelecionado?.status === StatusPeriodo.FECHADO ? "Reabri Período?" : "Fechar Período?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {periodoSelecionado?.status === StatusPeriodo.FECHADO ? (
                <>
                  Tem a certeza que quer <strong>reabrir</strong> o período de{" "}
                  <strong>{periodoSelecionado?.nome}</strong>? Isso permitirá novos
                  lançamentos neste período e fará com que os períodos subsequentes sejam reabertos
                  para ajustes. </>
              ) : (
                <>
                  Tem a certeza que quer <strong>fechar</strong> o período de {" "}
                  <strong>{periodoSelecionado?.nome}</strong>?
                  <br />O fecho impedirá lançamentos neste período e abrirá o mês subsequente.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleFechado}
              className={periodoSelecionado?.status === StatusPeriodo.FECHADO ? "bg-orange-600 hover:bg-orange-700" : "bg-red-600 hover:bg-red-700"}
              disabled={salvando}
            >
              {periodoSelecionado?.status === StatusPeriodo.FECHADO ? (
                <>
                  {salvando ? "A Reabrir..." : "Sim, Reabrir"}
                </>
              ) : (
                <>
                  {salvando ? "A Fechar..." : "Sim, Fechar"}
                </>
              )
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar Exercício?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que pretende apagar o exercício {" "}
              <strong>{exercicioSelecionado?.nome}</strong>? Esta ação é irreversível.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApagar}
              className="bg-red-600 hover:bg-red-700"
              disabled={salvando}
            >
              {salvando ? "A apagar..." : "Sim, Apagar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}