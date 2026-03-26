"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Search, Edit, Trash2, Eye, UserCheck, UserX } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Detalhes from "./components/dialogDetalhes";
import DeletarRole from "./components/dialogDeletar";
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import CriarRole from "./components/dialogCriarRole";
import DeletarVarios from "./components/deletarVarios";

type Usuario = {
  id: string;
  email: string;
  nome: string;
  ativo: boolean;
  criadoEm: string;
};

type Role = {
  id: string;
  nome: string;
  descricao: string;
  criadoPor: string;
  ativo: boolean;
  criadoEm: string;
  permissions: RolePermission[];
  criadopor: Usuario;
};

type UserRole = {
  id: string;
  userId: string;
  roleId: string;
};

type RolePermission = {
  id: string;
  roleId: string;
  permissionId: string;
  permission: Permission;
};

type Permission = {
  id: string;
  nome: string;
  descricao: string;
  recurso: string;
  ativo: boolean;
}
const estadoInicial = {
  nome: " ",
  descricao: " ",
  permissoes: [],
}
export default function PapeisPage() {
  const [papeis, setPapeis] = useState<Role[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [permissoes, setPermissoes] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [abrirDetalhes, setAbrirDetalhes] = useState(false);
  const [abrirDeletar, setAbrirDeletar] = useState(false);
  const [papelSelecionado, setPapelSelecionado] = useState<Role | null>(null);
  const [abrirNovo, setAbrirNovo] = useState(false);
  const [form, setForm] = useState(estadoInicial);
  const [salvando, setSalvando] = useState(false);
  const [permissoesSelecionadas, setPermissoesSelecionadas] = useState<Permission[]>([]);
  const [papelDeletar, setpapelDeletar] = useState<Role | null>(null);
  const [selecionar, setSelecionar] = useState(false);
  const [perfisSelecionados, setPerfisSelecionados] = useState<Role[]>([]);
  const [abriDeletarV, setAbrirDeletarV] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setSelecionar(false);
      const response = await fetch("/api/usuarios");
      const response1 = await fetch("/api/roles");
      const response2 = await fetch("/api/permissions");
      const data = await response.json();
      const data1 = await response1.json();
      const data2 = await response2.json();
      setUsuarios(data || []);
      setPapeis(data1 || []);
      setPermissoes(data2 || []);
    } catch (erro) {
      console.log("Erro ao carregar dados", erro);
      toast({
        title: "Erro",
        variant: "destructive",
        description: "Ocorreu um erro inesperado"
      });
    }
    finally {
      setLoading(false);
    }
  }

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form, permissoes: permissoesSelecionadas,
        }),
      });

      if (response.ok) {
        setForm({
          nome: "",
          descricao: "",
          permissoes: [],
        });
        setPermissoesSelecionadas([]);
        await carregarDados();
        setAbrirNovo(false);
        toast({
          title: "Sucesso!",
          variant: "success",
          description: "Papel adicionado com sucesso"
        });
      } else {
        const data = await response.json();
        toast({
          title: "Erro",
          variant: "destructive",
          description: data.message || "Ocorreu um erro inesperado"
        });
      }
    } catch (erro) {
      console.log(erro);
      toast({
        title: "Erro",
        variant: "destructive",
        description: "Ocorreu um erro inesperado"
      });
    }
  }

  const handleDeletar = async (e: React.FormEvent) => {
    if (!papelDeletar) return;
    setSalvando(true);
    e.preventDefault();
    try {
      const response = await fetch(`/api/roles/${papelDeletar.id}/deletar`, {
        method: "DELETE",
      });

      if (response.ok) {
        await carregarDados();
        setAbrirDeletar(false);
        setpapelDeletar(null);
        toast({
          title: "Sucesso!",
          variant: "success",
          description: "Papel apagado com sucesso"
        });
      } else {
        const data = await response.json();
        toast({
          title: "Erro",
          variant: "destructive",
          description: data.message || "Ocorreu um erro inesperado"
        });
      }
    } catch (erro) {
      console.log(erro);
      toast({
        title: "Erro",
        variant: "destructive",
        description: "Ocorreu um erro inesperado"
      });
    }
    finally {
      setSalvando(false);
    }
  }


  const selecionarPerfil = (p: Role, a: boolean) => {
    if (a === false) {
      setPerfisSelecionados(perfisSelecionados.filter((per) => per.id !== p.id));
    } else {
      setPerfisSelecionados([p, ...perfisSelecionados]);
    }
  }

  const handleselecionar = () => {
    if (selecionar) {
      setSelecionar(false);
      setPerfisSelecionados([]);
    } else setSelecionar(true);
  }

  const handleDeletarVarios = async (e: React.FormEvent) => {
    if (!perfisSelecionados) return;
    setSalvando(true);
    e.preventDefault();
    try {
      const response = await fetch(`/api/roles`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          papeis: perfisSelecionados,
        }),
      });

      if (response.ok) {
        await carregarDados();
        setAbrirDeletarV(false);
        setPerfisSelecionados([]);
        toast({
          title: "Sucesso!",
          variant: "success",
          description: "Papeis apagados com sucesso"
        });
      } else {
        const data = await response.json();
        toast({
          title: "Erro",
          variant: "destructive",
          description: data.message || "Ocorreu um erro inesperado"
        });
      }
    } catch (erro) {
      console.log(erro);
      toast({
        title: "Erro",
        variant: "destructive",
        description: "Ocorreu um erro inesperado"
      });
    }
    finally {
      setSalvando(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex-cols space-y-3 md:flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
          Perfis do sistema
        </h1>
        <Button className="bg-emerald-600 hover:bg-emerald-700"
          onClick={() => setAbrirNovo(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar perfil
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <p>Lista de perfis</p>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleselecionar}
            >
              {selecionar ? "Desselecionar" : "Selecionar"}
            </Button>
          </CardTitle>
          <CardDescription>
            {!selecionar ? (
              `${papeis.length} Perfil(s) encontrado(s)`) : (
              <div>
                <div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setAbrirDeletarV(true) }}
                    disabled={perfisSelecionados.length < 2}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <p>{perfisSelecionados.length} perfis selecionados</p>
                </div>
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Carregando Perfis...</div>
          ) : papeis.length === 0 ? (
            <div className="text-center py-8 text-slate-500">Nenhum Perfil encontrado</div>
          ) : (
            <ScrollArea className="h-[500px] overflow-scroll-x-auto">
              <div className="space-y-3">
                {papeis.map((papel) => (
                  <div>
                    {!(papel.nome==="ADMIN") && selecionar && (<input
                      type="checkbox"
                      className="rounded fade"
                      checked={perfisSelecionados.includes(papel)}
                      onChange={(e) => selecionarPerfil(papel, e.target.checked)}
                    />)}
                    <Card key={papel.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="md:flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold ${papel.ativo ? papel.nome ==="ADMIN" ? "bg-red-600":"bg-emerald-600" : "bg-gray-400"}`}>
                              {papel.nome.charAt(0).toUpperCase()}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold">{papel.nome}</h3>
                                {!(papel.nome==="ADMIN")&&(
                                  <Badge variant={papel.ativo ? "default" : "secondary"}>
                                  {papel.ativo ? (
                                    <><UserCheck className="h-3 w-3 mr-1" />Ativo</>
                                  ) : (
                                    <><UserX className="h-3 w-3 mr-1" /> Inativo</>
                                  )}
                                </Badge>
                                )}
                              </div>
                              {!(papel.nome==="ADMIN") &&
                              (<p className="text-xs text-muted-foreground">
                                Criado em: {format(new Date(papel.criadoEm), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </p>)}
                            </div>
                          </div>
                          <div className="md:flex items-center space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setAbrirDetalhes(true);
                                setPapelSelecionado(papel);
                              }}
                              className="text-slate-600 hover:text-slate-700 hover:bg-slate-50"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {!(papel.nome==="ADMIN") ?
                            !selecionar && 
                             (<div>
                               <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => abrirEdicao(papel)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => { setAbrirDeletar(true); setpapelDeletar(papel); }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                             </div>):(<></>)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Detalhes
        abrir={abrirDetalhes}
        setAbrir={setAbrirDetalhes}
        detalhesPapel={papelSelecionado} />

      <CriarRole
        abrir={abrirNovo}
        setAbrir={setAbrirNovo}
        onSubmit={handleSalvar}
        novoPapel={form}
        setNovoPapel={setForm}
        permissoes={permissoes}
        permissoesSelecionadas={permissoesSelecionadas}
        setPermissoesSelecionadas={setPermissoesSelecionadas}
      />

      <DeletarRole
        abrir={abrirDeletar}
        setAbrir={setAbrirDeletar}
        papel={papelDeletar}
        handleDesativar={handleDeletar}
        loading={salvando}
      />

      <DeletarVarios
        abrir={abriDeletarV}
        setAbrir={setAbrirDeletarV}
        quantidade={perfisSelecionados.length}
        handleDesativar={handleDeletarVarios}
        loading={salvando}
      />
    </div>
  );
}
