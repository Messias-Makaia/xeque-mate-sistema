"use client";

import { use, useEffect, useState } from "react";
import { Users, Plus, Search, Edit, Filter, Trash2, Eye, UserCheck, UserX } from "lucide-react";
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import CriarUser from "./components/dialogCriar";
import EditarUser from "./components/dialogEditar";
import { useToast } from "@/hooks/use-toast";

type Usuario = {
  id: string;
  email: string;
  nome: string;
  ativo: boolean;
  criadoEm: string;
  criadoPor?: string | null;
  criador?: {
    nome: string;
    email: string;
  } | null;
  usuariosCriados?: {
    id: string;
    nome: string;
    email: string;
    ativo: boolean;
  }[];
  roles: UserRole[];
};

type Role = {
  id: string;
  nome: string;
  descricao: string;
  criadoPor: string;
  ativo: boolean;
  criadoEm: string;
};

type UserRole = {
  id: string;
  userId: string;
  roleId: string;
  role: Role;
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
export default function UsuariosPage() {
  const { toast } = useToast();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [usuarioEdit, setUsuarioEdit] = useState<Usuario | null>(null);
  const [usuarioDetails, setUsuarioDetails] = useState<Usuario | null>(null);
  const [usuarioDelete, setUsuarioDelete] = useState<Usuario>();
  const [roles, setRoles] = useState<Role[] | null>([]);
  const [rolesSelecionados, setRolesSelecionados] = useState<Role[]>([]);
  const [editURoles, setEditURoles] = useState<Role[]>([])
  const [filtroRole, setFiltroRole] = useState<string>("TODOS");
  const [editU, setEditU] = useState({
    nome: "", email: "", senha: "", confirmarSenha: "", ativo: false,
  });
  // Novo usuário
  const [novoUsuario, setNovoUsuario] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });

  useEffect(() => {
    carregarUsuarios();
  }, []);

  useEffect(() => {
    filtrarUsuarios();
  }, [usuarios, searchTerm, filtroRole]);

  const carregarUsuarios = async () => {
    try {
      const response = await fetch("/api/usuarios");
      const roles = await fetch("/api/roles");
      const data = await response.json();
      const role = await roles.json();
      setRoles(role || null);

      setUsuarios(data || []);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtrarUsuarios = () => {
    let resultado = [...usuarios];

    if (filtroRole !== "TODOS") {
      resultado = resultado.filter((c) => c.roles.find((r)=> r.role.nome===filtroRole)?.role.nome===filtroRole)
    }

    if (searchTerm) {
      resultado = resultado.filter(
        (u) =>
          u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsuarios(resultado);
  };

  const resetForm = () => {
    setNovoUsuario({
      nome: "",
      email: "",
      senha: "",
      confirmarSenha: "",
    });
  };

  const handleCriarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();

    if (novoUsuario.senha !== novoUsuario.confirmarSenha) {
      toast({
        title: "Senhas não coincidem",
        variant: "destructive",
        description: "Por favor, verifique as senhas que digitou"
      });
      return;
    }

    if (novoUsuario.senha.length < 6) {
      toast({
        title: "Senha muito curta",
        variant: "destructive",
        description: "A senha deve ter pelo menos 6 digitos"
      });
      return;
    }

    try {
      const response = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: novoUsuario.nome,
          email: novoUsuario.email,
          senha: novoUsuario.senha,
          roles: rolesSelecionados,
        }),
      });

      if (response.ok) {
        await carregarUsuarios();
        setDialogOpen(false);
        resetForm();
        setRolesSelecionados([]);
        toast({
          title: "Sucesso",
          variant: "success",
          description: "Usuário criado com sucesso"
        });
        return;
      } else {
        const error = await response.json();
        toast({
          title: "Erro",
          variant: "destructive",
          description: error.message || "Ocorreu um erro inesperado",
        });
        return;
      }
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      toast({
        title: "Erro",
        variant: "destructive",
        description: "Ocorreu um erro inesperado",
      });
    }
  };

  const abrirEdicao = (usuario: Usuario) => {
    setUsuarioEdit(usuario);
    setEditU({
      nome: usuario.nome,
      email: usuario.email,
      senha: "",
      confirmarSenha: "",
      ativo: usuario.ativo,
    });
    const r = usuario.roles.map((ro) => ro.role);
    setEditURoles(r);
    setEditDialogOpen(true);
  };

  const handleEditarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuarioEdit) return;

    // Se senha foi fornecida, validar
    if (novoUsuario.senha) {
      if (novoUsuario.senha !== novoUsuario.confirmarSenha) {
        alert("As senhas não coincidem!");
        return;
      }

      if (novoUsuario.senha.length < 6) {
        alert("A senha deve ter pelo menos 6 caracteres!");
        return;
      }
    }

    try {
      const body: any = {
        nome: editU.nome,
        email: editU.email,
        roles: editURoles,
      };

      // Só enviar senha se foi preenchida
      if (editU.senha) {
        body.senha = editU.senha;
      }

      const response = await fetch(`/api/usuarios/${usuarioEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await carregarUsuarios();
        setEditDialogOpen(false);
        setUsuarioEdit(null);
        setEditURoles([]);
        resetForm();
        toast({
          title: "Sucesso!",
          variant: "success",
          description: "Usuário editado com sucesso",
        })
      } else {
        const error = await response.json();
        toast({
          title: "Sucesso!",
          variant: "destructive",
          description: error.message || "Ocorreu um erro inesperado",
        })
      }
    } catch (error) {
      console.error("Erro ao editar usuário:", error);
      toast({
        title: "Sucesso!",
        variant: "success",
        description: "Ocorreu um erro inesperado",
      })
    }
  };

  const abrirDetalhes = async (usuario: Usuario) => {
    try {
      // Buscar detalhes completos do usuário
      const response = await fetch(`/api/usuarios/${usuario.id}`);
      if (response.ok) {
        const data = await response.json();
        setUsuarioDetails(data);
        setDetailsDialogOpen(true);
      } else {
        alert("Erro ao carregar detalhes do usuário");
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes:", error);
      alert("Erro ao carregar detalhes");
    }
  };

  const confirmarDelete = (usuario: Usuario) => {
    setUsuarioDelete(usuario);
    setDeleteDialogOpen(true);
  };

  const handleDesativar = async () => {
    if (!usuarioDelete) return;

    try {
      const response = await fetch(`/api/usuarios/${usuarioDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await carregarUsuarios();
        setDeleteDialogOpen(false);
        setUsuarioDelete(undefined);
        alert("Usuário desativado com sucesso!");
      } else {
        const error = await response.json();
        alert(error.message || "Erro ao desativar usuário");
      }
    } catch (error) {
      console.error("Erro ao desativar usuário:", error);
      alert("Erro ao desativar usuário");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3 md:flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
            <Users className="h-8 w-8 text-emerald-600" />
            <span>Gestão de usuários</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Controle completo de usuários do sistema
          </p>
        </div>

        <Button className="bg-emerald-600 hover:bg-emerald-700"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>

        <CriarUser
          abrir={dialogOpen}
          setAbrir={setDialogOpen}
          onSubmit={handleCriarUsuario}
          novoPapel={novoUsuario}
          setNovoPapel={setNovoUsuario}
          permissoes={roles}
          permissoesSelecionadas={rolesSelecionados}
          setPermissoesSelecionadas={setRolesSelecionados}
        />
      </div>

      {/* Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filtroRole} onValueChange={setFiltroRole}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos os perfis</SelectItem>
              {roles?.map((r) => (
                <SelectItem value={r.nome}>{r.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>
          
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários Cadastrados</CardTitle>
          <CardDescription>
            {filteredUsuarios.length} usuário(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Carregando...</div>
          ) : filteredUsuarios.length === 0 ? (
            <div className="text-center py-8 text-slate-500">Nenhum usuário encontrado</div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-3">
                {filteredUsuarios.map((usuario) => (
                  <Card key={usuario.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="md:flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold ${usuario.ativo ? "bg-emerald-600" : "bg-gray-400"
                            }`}>
                            {usuario.nome.charAt(0).toUpperCase()}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">{usuario.nome}</h3>
                              <Badge variant={usuario.ativo ? "default" : "secondary"}>
                                {usuario.ativo ? (
                                  <><UserCheck className="h-3 w-3 mr-1" /> Ativo</>
                                ) : (
                                  <><UserX className="h-3 w-3 mr-1" /> Inativo</>
                                )}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{usuario.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Cadastrado em: {format(new Date(usuario.criadoEm), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => abrirDetalhes(usuario)}
                            className="text-slate-600 hover:text-slate-700 hover:bg-slate-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => abrirEdicao(usuario)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {usuario.ativo && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => confirmarDelete(usuario)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <EditarUser
        abrir={editDialogOpen}
        setAbrir={setEditDialogOpen}
        onSubmit={handleEditarUsuario}
        novoPapel={editU}
        setNovoPapel={setEditU}
        permissoes={roles}
        permissoesSelecionadas={editURoles}
        setPermissoesSelecionadas={setEditURoles}
      />

      {/* Dialog de Edição */}
      {/* <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Modifique os dados do usuário (deixe a senha em branco para não alterar)
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditarUsuario} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nome">Nome Completo *</Label>
              <Input
                id="edit-nome"
                value={novoUsuario.nome}
                onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
                placeholder="Ex: João Silva"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={novoUsuario.email}
                onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
                placeholder="usuario@exemplo.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-senha">Nova Senha (opcional)</Label>
              <Input
                id="edit-senha"
                type="password"
                value={novoUsuario.senha}
                onChange={(e) => setNovoUsuario({ ...novoUsuario, senha: e.target.value })}
                placeholder="Deixe em branco para não alterar"
                minLength={6}
              />
            </div>

            {novoUsuario.senha && (
              <div className="space-y-2">
                <Label htmlFor="edit-confirmarSenha">Confirmar Nova Senha</Label>
                <Input
                  id="edit-confirmarSenha"
                  type="password"
                  value={novoUsuario.confirmarSenha}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, confirmarSenha: e.target.value })}
                  placeholder="Digite a senha novamente"
                  required
                />
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => {
                setEditDialogOpen(false);
                setUsuarioEdit(null);
                resetForm();
              }}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Salvar Alterações
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog> */}

      {/* Dialog de Detalhes */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do Usuário</DialogTitle>
          </DialogHeader>
          {usuarioDetails && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className={`h-16 w-16 rounded-full flex items-center justify-center text-white text-2xl font-bold ${usuarioDetails.ativo ? "bg-emerald-600" : "bg-gray-400"
                  }`}>
                  {usuarioDetails.nome.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{usuarioDetails.nome}</h3>
                  <p className="text-sm text-muted-foreground">{usuarioDetails.email}</p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs text-muted-foreground">Perfis de acesso</Label>
                    {usuarioDetails.roles.map((r) => (
                      <p className="font-medium">
                        <Badge
                          className={r.role.ativo ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600"}
                        >
                          {r.role.nome}
                        </Badge>
                      </p>
                    ))}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <p className="font-medium">
                      <Badge variant={usuarioDetails.ativo ? "default" : "secondary"}>
                        {usuarioDetails.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Cadastrado em</Label>
                  <p className="font-medium">
                    {format(new Date(usuarioDetails.criadoEm), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>

                {usuarioDetails.criador && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Criado por</Label>
                    <p className="font-medium">{usuarioDetails.criador.nome}</p>
                    <p className="text-sm text-muted-foreground">{usuarioDetails.criador.email}</p>
                  </div>
                )}

                {usuarioDetails.usuariosCriados && usuarioDetails.usuariosCriados.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Usuários criados por este usuário ({usuarioDetails.usuariosCriados.length})
                    </Label>
                    <ScrollArea className="h-[200px] pr-4">
                      <div className="mt-2 space-y-1">
                        {usuarioDetails.usuariosCriados.map((u) => (
                          <div key={u.id} className="text-sm p-2 bg-slate-50 rounded flex items-center justify-between">
                            <span>{u.nome}</span>
                            <Badge variant={u.ativo ? "default" : "secondary"} className="text-xs">
                              {u.ativo ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button onClick={() => setDetailsDialogOpen(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AlertDialog de Confirmação de Desativação */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Desativação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar este usuário? O usuário não será removido do banco de dados,
              apenas marcado como inativo e não poderá mais acessar o sistema.
              {usuarioDelete && (
                <div className="mt-4 p-3 bg-slate-100 rounded">
                  <p className="font-semibold">{usuarioDelete.nome}</p>
                  <p className="text-sm">{usuarioDelete.email}</p>
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
