"use client";

import { useEffect, useState } from "react";
import { BookOpen, Plus, Search, Filter, ChevronRight, ChevronDown, Edit, Trash2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";

type Conta = {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string | null;
  tipo: string;
  natureza: string;
  nivel: number;
  contaPai?: string | null;
  aceitaLancamento: boolean;
  ativa: boolean;
};

export default function PlanoContasPage() {
  const [contas, setContas] = useState<Conta[]>([]);
  const [filteredContas, setFilteredContas] = useState<Conta[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("TODOS");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [contaEdit, setContaEdit] = useState<Conta | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contaDelete, setContaDelete] = useState<Conta | null>(null);

  // Nova conta
  const [novaConta, setNovaConta] = useState({
    codigo: "",
    nome: "",
    descricao: "",
    tipo: "ATIVO",
    natureza: "DEVEDORA",
    nivel: 1,
    contaPai: "",
    aceitaLancamento: true,
  });

  useEffect(() => {
    carregarContas();
  }, []);

  useEffect(() => {
    filtrarContas();
  }, [contas, searchTerm, filtroTipo]);

  const carregarContas = async () => {
    try {
      const response = await fetch("/api/contas?ativas=true");
      const data = await response.json();
      setContas(data || []);
    } catch (error) {
      console.error("Erro ao carregar contas:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtrarContas = () => {
    let resultado = [...contas];

    if (filtroTipo !== "TODOS") {
      resultado = resultado.filter((c) => c.tipo === filtroTipo);
    }

    if (searchTerm) {
      resultado = resultado.filter(
        (c) =>
          c.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredContas(resultado);
  };

  const toggleExpand = (codigo: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(codigo)) {
      newExpanded.delete(codigo);
    } else {
      newExpanded.add(codigo);
    }
    setExpandedItems(newExpanded);
  };

  const handleCriarConta = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/contas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novaConta),
      });

      if (response.ok) {
        await carregarContas();
        setDialogOpen(false);
        setNovaConta({
          codigo: "",
          nome: "",
          descricao: "",
          tipo: "ATIVO",
          natureza: "DEVEDORA",
          nivel: 1,
          contaPai: "",
          aceitaLancamento: true,
        });
        alert("Conta criada com sucesso!");
      } else {
        const error = await response.json();
        alert(error.message || "Erro ao criar conta");
      }
    } catch (error) {
      console.error("Erro ao criar conta:", error);
      alert("Erro ao criar conta");
    }
  };

  const abrirEdicao = (conta: Conta) => {
    setContaEdit(conta);
    setNovaConta({
      codigo: conta.codigo,
      nome: conta.nome,
      descricao: conta.descricao || "",
      tipo: conta.tipo,
      natureza: conta.natureza,
      nivel: conta.nivel,
      contaPai: conta.contaPai || "",
      aceitaLancamento: conta.aceitaLancamento,
    });
    setEditDialogOpen(true);
  };

  const handleEditarConta = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contaEdit) return;

    try {
      const response = await fetch(`/api/contas/${contaEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novaConta),
      });

      if (response.ok) {
        await carregarContas();
        setEditDialogOpen(false);
        setContaEdit(null);
        setNovaConta({
          codigo: "",
          nome: "",
          descricao: "",
          tipo: "ATIVO",
          natureza: "DEVEDORA",
          nivel: 1,
          contaPai: "",
          aceitaLancamento: true,
        });
        alert("Conta editada com sucesso!");
      } else {
        const error = await response.json();
        alert(error.message || "Erro ao editar conta");
      }
    } catch (error) {
      console.error("Erro ao editar conta:", error);
      alert("Erro ao editar conta");
    }
  };

  const confirmarDelete = (conta: Conta) => {
    setContaDelete(conta);
    setDeleteDialogOpen(true);
  };

  const handleDesativar = async () => {
    if (!contaDelete) return;

    try {
      const response = await fetch(`/api/contas/${contaDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await carregarContas();
        setDeleteDialogOpen(false);
        setContaDelete(null);
        alert("Conta desativada com sucesso!");
      } else {
        const error = await response.json();
        alert(error.message || "Erro ao desativar conta");
      }
    } catch (error) {
      console.error("Erro ao desativar conta:", error);
      alert("Erro ao desativar conta");
    }
  };

  const renderContaHierarquica = (conta: Conta) => {
    const filhas = filteredContas.filter((c) => c.contaPai === conta.codigo);
    const temFilhas = filhas.length > 0;
    const isExpanded = expandedItems.has(conta.codigo);

    const badgeColor = {
      ATIVO: "bg-blue-100 text-blue-800",
      PASSIVO: "bg-red-100 text-red-800",
      CAPITAL: "bg-purple-100 text-purple-800",
      RECEITA: "bg-green-100 text-green-800",
      CUSTO: "bg-orange-100 text-orange-800",
    }[conta.tipo] || "bg-gray-100 text-gray-800";

    return (
      <div key={conta.id} className="space-y-1">
        <div
          className="flex items-center space-x-2 py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors group"
          style={{ paddingLeft: `${conta.nivel * 1.5}rem` }}
        >
          {temFilhas ? (
            <button
              onClick={() => toggleExpand(conta.codigo)}
              className="text-slate-400 hover:text-slate-600"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <div className="w-4" />
          )}
          
          <div className="flex-1 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <code className="text-sm font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                {conta.codigo}
              </code>
              <span className="font-medium text-slate-900">{conta.nome}</span>
              {conta.descricao && (
                <span className="text-xs text-slate-500 italic">({conta.descricao})</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={badgeColor} variant="secondary">
                {conta.tipo}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {conta.natureza}
              </Badge>
              {!conta.aceitaLancamento && (
                <Badge variant="outline" className="text-xs border-amber-300 text-amber-700">
                  Sintética
                </Badge>
              )}
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    abrirEdicao(conta);
                  }}
                  className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmarDelete(conta);
                  }}
                  className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {temFilhas && isExpanded && (
          <div>
            {filhas.map((filha) => renderContaHierarquica(filha))}
          </div>
        )}
      </div>
    );
  };

  const contasRaiz = filteredContas.filter((c) => !c.contaPai || c.nivel === 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-emerald-600" />
            <span>Plano de Contas</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Estrutura hierárquica baseada no PGC de Angola
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Conta</DialogTitle>
              <DialogDescription>
                Preencha os dados da nova conta contábil
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCriarConta} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código *</Label>
                  <Input
                    id="codigo"
                    value={novaConta.codigo}
                    onChange={(e) => setNovaConta({ ...novaConta, codigo: e.target.value })}
                    placeholder="Ex: 26.4"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nivel">Nível *</Label>
                  <Input
                    id="nivel"
                    type="number"
                    min="1"
                    max="5"
                    value={novaConta.nivel}
                    onChange={(e) => setNovaConta({ ...novaConta, nivel: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Conta *</Label>
                <Input
                  id="nome"
                  value={novaConta.nome}
                  onChange={(e) => setNovaConta({ ...novaConta, nome: e.target.value })}
                  placeholder="Ex: Produtos Veterinários"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={novaConta.descricao}
                  onChange={(e) => setNovaConta({ ...novaConta, descricao: e.target.value })}
                  placeholder="Descrição opcional da conta"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select
                    value={novaConta.tipo}
                    onValueChange={(value) => setNovaConta({ ...novaConta, tipo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ATIVO">ATIVO</SelectItem>
                      <SelectItem value="PASSIVO">PASSIVO</SelectItem>
                      <SelectItem value="CAPITAL">CAPITAL</SelectItem>
                      <SelectItem value="RECEITA">RECEITA</SelectItem>
                      <SelectItem value="CUSTO">CUSTO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="natureza">Natureza *</Label>
                  <Select
                    value={novaConta.natureza}
                    onValueChange={(value) => setNovaConta({ ...novaConta, natureza: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DEVEDORA">DEVEDORA</SelectItem>
                      <SelectItem value="CREDORA">CREDORA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contaPai">Código da Conta Pai (opcional)</Label>
                <Input
                  id="contaPai"
                  value={novaConta.contaPai}
                  onChange={(e) => setNovaConta({ ...novaConta, contaPai: e.target.value })}
                  placeholder="Ex: 26"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="aceitaLancamento"
                  checked={novaConta.aceitaLancamento}
                  onChange={(e) => setNovaConta({ ...novaConta, aceitaLancamento: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="aceitaLancamento" className="cursor-pointer">
                  Aceita lançamentos (contas analíticas)
                </Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                  Criar Conta
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por código ou nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos os Tipos</SelectItem>
                <SelectItem value="ATIVO">ATIVO</SelectItem>
                <SelectItem value="PASSIVO">PASSIVO</SelectItem>
                <SelectItem value="CAPITAL">CAPITAL</SelectItem>
                <SelectItem value="RECEITA">RECEITA</SelectItem>
                <SelectItem value="CUSTO">CUSTO</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Contas */}
      <Card>
        <CardHeader>
          <CardTitle>Estrutura Hierárquica</CardTitle>
          <CardDescription>
            {filteredContas.length} contas encontradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            {loading ? (
              <div className="text-center py-8 text-slate-500">Carregando...</div>
            ) : filteredContas.length === 0 ? (
              <div className="text-center py-8 text-slate-500">Nenhuma conta encontrada</div>
            ) : (
              <div className="space-y-1">
                {contasRaiz.map((conta) => renderContaHierarquica(conta))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Conta</DialogTitle>
            <DialogDescription>
              Modifique os dados da conta contábil
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditarConta} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-codigo">Código *</Label>
                <Input
                  id="edit-codigo"
                  value={novaConta.codigo}
                  onChange={(e) => setNovaConta({ ...novaConta, codigo: e.target.value })}
                  placeholder="Ex: 26.4"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-nivel">Nível *</Label>
                <Input
                  id="edit-nivel"
                  type="number"
                  min="1"
                  max="5"
                  value={novaConta.nivel}
                  onChange={(e) => setNovaConta({ ...novaConta, nivel: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-nome">Nome da Conta *</Label>
              <Input
                id="edit-nome"
                value={novaConta.nome}
                onChange={(e) => setNovaConta({ ...novaConta, nome: e.target.value })}
                placeholder="Ex: Produtos Veterinários"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-descricao">Descrição</Label>
              <Textarea
                id="edit-descricao"
                value={novaConta.descricao}
                onChange={(e) => setNovaConta({ ...novaConta, descricao: e.target.value })}
                placeholder="Descrição opcional da conta"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-tipo">Tipo *</Label>
                <Select
                  value={novaConta.tipo}
                  onValueChange={(value) => setNovaConta({ ...novaConta, tipo: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ATIVO">ATIVO</SelectItem>
                    <SelectItem value="PASSIVO">PASSIVO</SelectItem>
                    <SelectItem value="CAPITAL">CAPITAL</SelectItem>
                    <SelectItem value="RECEITA">RECEITA</SelectItem>
                    <SelectItem value="CUSTO">CUSTO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-natureza">Natureza *</Label>
                <Select
                  value={novaConta.natureza}
                  onValueChange={(value) => setNovaConta({ ...novaConta, natureza: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DEVEDORA">DEVEDORA</SelectItem>
                    <SelectItem value="CREDORA">CREDORA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-contaPai">Código da Conta Pai (opcional)</Label>
              <Input
                id="edit-contaPai"
                value={novaConta.contaPai}
                onChange={(e) => setNovaConta({ ...novaConta, contaPai: e.target.value })}
                placeholder="Ex: 26"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-aceitaLancamento"
                checked={novaConta.aceitaLancamento}
                onChange={(e) => setNovaConta({ ...novaConta, aceitaLancamento: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="edit-aceitaLancamento" className="cursor-pointer">
                Aceita lançamentos (contas analíticas)
              </Label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Salvar Alterações
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* AlertDialog de Confirmação de Deleção */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Desativação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar esta conta? A conta não será removida do banco de dados,
              apenas marcada como inativa e não aparecerá mais nas listagens.
              {contaDelete && (
                <div className="mt-4 p-3 bg-slate-100 rounded">
                  <p className="font-semibold">{contaDelete.codigo} - {contaDelete.nome}</p>
                  <p className="text-sm">{contaDelete.tipo} / {contaDelete.natureza}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDesativar}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirmar Desativação
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
