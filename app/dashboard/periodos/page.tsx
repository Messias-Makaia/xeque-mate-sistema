"use client";

import { useEffect, useState } from "react";
import { Calendar, Plus, Lock, Unlock, AlertCircle } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { usePermission } from "@/hooks/usePermission";

type PeriodoContabil = {
  id: string;
  nome: string;
  tipo: string;
  dataInicio: string;
  dataFim: string;
  fechado: boolean;
  exercicioId?: string | null;
  exercicio?: { id: string; nome: string } | null;
  criadopor?: { nome: string } | null;
  _count?: { lancamentos: number };
};

export default function PeriodosPage() {
  const { can } = usePermission();

  const [periodos, setPeriodos] = useState<PeriodoContabil[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fecharDialogOpen, setFecharDialogOpen] = useState(false);
  const [periodoFechar, setPeriodoFechar] = useState<PeriodoContabil | null>(null);

  const [novoPeriodo, setNovoPeriodo] = useState({
    nome: "",
    tipo: "MES",
    dataInicio: "",
    dataFim: "",
    exercicioId: "",
  });

  useEffect(() => {
    if (can("periodos.ver")) carregarPeriodos();
    else setLoading(false);
  }, []);

  const carregarPeriodos = async () => {
    try {
      const res = await fetch("/api/periodos");
      const data = await res.json();
      setPeriodos(data || []);
    } catch (error) {
      console.error("Erro ao carregar períodos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCriarPeriodo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/periodos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoPeriodo),
      });

      if (res.ok) {
        await carregarPeriodos();
        setDialogOpen(false);
        setNovoPeriodo({ nome: "", tipo: "MES", dataInicio: "", dataFim: "", exercicioId: "" });
        alert("Período criado com sucesso!");
      } else {
        const error = await res.json();
        alert(error.message || "Erro ao criar período");
      }
    } catch (error) {
      console.error("Erro ao criar período:", error);
      alert("Erro ao criar período");
    }
  };

  const confirmarFechar = (periodo: PeriodoContabil) => {
    setPeriodoFechar(periodo);
    setFecharDialogOpen(true);
  };

  const handleFecharPeriodo = async () => {
    if (!periodoFechar) return;
    try {
      const res = await fetch(`/api/periodos/${periodoFechar.id}/fechar`, {
        method: "PATCH",
      });

      if (res.ok) {
        await carregarPeriodos();
        setFecharDialogOpen(false);
        setPeriodoFechar(null);
        alert("Período fechado com sucesso!");
      } else {
        const error = await res.json();
        alert(error.message || "Erro ao fechar período");
      }
    } catch (error) {
      console.error("Erro ao fechar período:", error);
      alert("Erro ao fechar período");
    }
  };

  // Bloquear acesso se não tiver permissão
  if (!can("periodos.ver")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <AlertCircle className="h-16 w-16 text-red-400" />
        <h2 className="text-xl font-bold text-slate-800">Acesso Negado</h2>
        <p className="text-muted-foreground">Não tens permissão para ver os períodos contabilísticos.</p>
      </div>
    );
  }

  const periodosAbertos = periodos.filter((p) => !p.fechado);
  const periodosFechados = periodos.filter((p) => p.fechado);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-emerald-600" />
            <span>Períodos Contabilísticos</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestão de exercícios e meses contabilísticos
          </p>
        </div>

        {/* Botão só aparece se puder CRIAR */}
        {can("periodos.criar") && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Novo Período
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Novo Período Contabilístico</DialogTitle>
                <DialogDescription>
                  Preencha os dados do novo período ou exercício
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCriarPeriodo} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={novoPeriodo.nome}
                    onChange={(e) => setNovoPeriodo({ ...novoPeriodo, nome: e.target.value })}
                    placeholder="Ex: Janeiro 2025"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select
                    value={novoPeriodo.tipo}
                    onValueChange={(value) => setNovoPeriodo({ ...novoPeriodo, tipo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MES">Mês</SelectItem>
                      <SelectItem value="EXERCICIO">Exercício (Ano)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataInicio">Data de Início *</Label>
                    <Input
                      id="dataInicio"
                      type="date"
                      value={novoPeriodo.dataInicio}
                      onChange={(e) => setNovoPeriodo({ ...novoPeriodo, dataInicio: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataFim">Data de Fim *</Label>
                    <Input
                      id="dataFim"
                      type="date"
                      value={novoPeriodo.dataFim}
                      onChange={(e) => setNovoPeriodo({ ...novoPeriodo, dataFim: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                    Criar Período
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <Unlock className="h-8 w-8 text-emerald-500" />
              <div>
                <p className="text-2xl font-bold">{periodosAbertos.length}</p>
                <p className="text-sm text-muted-foreground">Períodos Abertos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <Lock className="h-8 w-8 text-red-400" />
              <div>
                <p className="text-2xl font-bold">{periodosFechados.length}</p>
                <p className="text-sm text-muted-foreground">Períodos Fechados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold">{periodos.length}</p>
                <p className="text-sm text-muted-foreground">Total de Períodos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Períodos */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os Períodos</CardTitle>
          <CardDescription>{periodos.length} períodos encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            {loading ? (
              <div className="text-center py-8 text-slate-500">Carregando...</div>
            ) : periodos.length === 0 ? (
              <div className="text-center py-8 text-slate-500">Nenhum período encontrado</div>
            ) : (
              <div className="space-y-3">
                {periodos.map((periodo) => (
                  <div
                    key={periodo.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${periodo.fechado ? "bg-red-100" : "bg-emerald-100"}`}>
                        {periodo.fechado
                          ? <Lock className="h-4 w-4 text-red-500" />
                          : <Unlock className="h-4 w-4 text-emerald-600" />
                        }
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{periodo.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(periodo.dataInicio), "dd/MM/yyyy", { locale: ptBR })}
                          {" → "}
                          {format(new Date(periodo.dataFim), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                        {periodo.criadopor && (
                          <p className="text-xs text-slate-400">Criado por: {periodo.criadopor.nome}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">{periodo.tipo}</Badge>
                      {periodo._count && (
                        <Badge variant="secondary">{periodo._count.lancamentos} lançamentos</Badge>
                      )}
                      {periodo.fechado ? (
                        <Badge variant="destructive" className="gap-1">
                          <Lock className="h-3 w-3" /> Fechado
                        </Badge>
                      ) : (
                        <Badge className="gap-1 bg-emerald-600 hover:bg-emerald-700">
                          <Unlock className="h-3 w-3" /> Aberto
                        </Badge>
                      )}

                      {/* Botão de fechar: só aparece se aberto E tiver permissão */}
                      {!periodo.fechado && can("periodos.fechar") && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-orange-600 border-orange-300 hover:bg-orange-50"
                          onClick={() => confirmarFechar(periodo)}
                        >
                          <Lock className="h-3.5 w-3.5 mr-1" />
                          Fechar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* AlertDialog de Confirmação de Fecho */}
      <AlertDialog open={fecharDialogOpen} onOpenChange={setFecharDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Fecho de Período</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja fechar este período? Após o fecho, não será possível
              criar novos lançamentos neste período.
              {periodoFechar && (
                <div className="mt-4 p-3 bg-slate-100 rounded">
                  <p className="font-semibold">{periodoFechar.nome}</p>
                  <p className="text-sm">
                    {format(new Date(periodoFechar.dataInicio), "dd/MM/yyyy", { locale: ptBR })}
                    {" → "}
                    {format(new Date(periodoFechar.dataFim), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                  {periodoFechar._count && (
                    <p className="text-sm">{periodoFechar._count.lancamentos} lançamentos associados</p>
                  )}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFecharPeriodo}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Confirmar Fecho
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}