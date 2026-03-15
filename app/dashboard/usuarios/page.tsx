// "use client";

// import { useEffect, useState } from "react";
// import { Users, Plus, Search, Edit, Trash2, Eye, UserCheck, UserX } from "lucide-react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { Label } from "@/components/ui/label";
// import { format } from "date-fns";
// import { ptBR } from "date-fns/locale";

// type Usuario = {
//   id: string;
//   email: string;
//   nome: string;
//   ativo: boolean;
//   criadoEm: string;
//   criadoPor?: string | null;
//   criador?: {
//     nome: string;
//     email: string;
//   } | null;
//   usuariosCriados?: {
//     id: string;
//     nome: string;
//     email: string;
//     ativo: boolean;
//   }[];
// };

// export default function UsuariosPage() {
//   const [usuarios, setUsuarios] = useState<Usuario[]>([]);
//   const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [editDialogOpen, setEditDialogOpen] = useState(false);
//   const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [usuarioEdit, setUsuarioEdit] = useState<Usuario | null>(null);
//   const [usuarioDetails, setUsuarioDetails] = useState<Usuario | null>(null);
//   const [usuarioDelete, setUsuarioDelete] = useState<Usuario | null>(null);

//   // Novo usuário
//   const [novoUsuario, setNovoUsuario] = useState({
//     nome: "",
//     email: "",
//     senha: "",
//     confirmarSenha: "",
//     roleId: ""
//   });

//   useEffect(() => {
//     carregarUsuarios();
//   }, []);

//   useEffect(() => {
//     filtrarUsuarios();
//   }, [usuarios, searchTerm]);

//   const carregarUsuarios = async () => {
//     try {
//       const response = await fetch("/api/usuarios");
//       const data = await response.json();
//       setUsuarios(data || []);
//     } catch (error) {
//       console.error("Erro ao carregar usuários:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filtrarUsuarios = () => {
//     let resultado = [...usuarios];

//     if (searchTerm) {
//       resultado = resultado.filter(
//         (u) =>
//           u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           u.email.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     setFilteredUsuarios(resultado);
//   };

//   const resetForm = () => {
//     setNovoUsuario({
//       nome: "",
//       email: "",
//       senha: "",
//       confirmarSenha: "",
//     });
//   };

//   const handleCriarUsuario = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (novoUsuario.senha !== novoUsuario.confirmarSenha) {
//       alert("As senhas não coincidem!");
//       return;
//     }

//     if (novoUsuario.senha.length < 6) {
//       alert("A senha deve ter pelo menos 6 caracteres!");
//       return;
//     }

//     try {
//       const response = await fetch("/api/usuarios", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           nome: novoUsuario.nome,
//           email: novoUsuario.email,
//           senha: novoUsuario.senha,
//         }),
//       });

//       if (response.ok) {
//         await carregarUsuarios();
//         setDialogOpen(false);
//         resetForm();
//         alert("Usuário criado com sucesso!");
//       } else {
//         const error = await response.json();
//         alert(error.message || "Erro ao criar usuário");
//       }
//     } catch (error) {
//       console.error("Erro ao criar usuário:", error);
//       alert("Erro ao criar usuário");
//     }
//   };

//   const abrirEdicao = (usuario: Usuario) => {
//     setUsuarioEdit(usuario);
//     setNovoUsuario({
//       nome: usuario.nome,
//       email: usuario.email,
//       senha: "",
//       confirmarSenha: "",
//     });
//     setEditDialogOpen(true);
//   };

//   const handleEditarUsuario = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!usuarioEdit) return;

//     // Se senha foi fornecida, validar
//     if (novoUsuario.senha) {
//       if (novoUsuario.senha !== novoUsuario.confirmarSenha) {
//         alert("As senhas não coincidem!");
//         return;
//       }

//       if (novoUsuario.senha.length < 6) {
//         alert("A senha deve ter pelo menos 6 caracteres!");
//         return;
//       }
//     }

//     try {
//       const body: any = {
//         nome: novoUsuario.nome,
//         email: novoUsuario.email,
//       };

//       // Só enviar senha se foi preenchida
//       if (novoUsuario.senha) {
//         body.senha = novoUsuario.senha;
//       }

//       const response = await fetch(`/api/usuarios/${usuarioEdit.id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(body),
//       });

//       if (response.ok) {
//         await carregarUsuarios();
//         setEditDialogOpen(false);
//         setUsuarioEdit(null);
//         resetForm();
//         alert("Usuário editado com sucesso!");
//       } else {
//         const error = await response.json();
//         alert(error.message || "Erro ao editar usuário");
//       }
//     } catch (error) {
//       console.error("Erro ao editar usuário:", error);
//       alert("Erro ao editar usuário");
//     }
//   };

//   const abrirDetalhes = async (usuario: Usuario) => {
//     try {
//       // Buscar detalhes completos do usuário
//       const response = await fetch(`/api/usuarios/${usuario.id}`);
//       if (response.ok) {
//         const data = await response.json();
//         setUsuarioDetails(data);
//         setDetailsDialogOpen(true);
//       } else {
//         alert("Erro ao carregar detalhes do usuário");
//       }
//     } catch (error) {
//       console.error("Erro ao buscar detalhes:", error);
//       alert("Erro ao carregar detalhes");
//     }
//   };

//   const confirmarDelete = (usuario: Usuario) => {
//     setUsuarioDelete(usuario);
//     setDeleteDialogOpen(true);
//   };

//   const handleDesativar = async () => {
//     if (!usuarioDelete) return;

//     try {
//       const response = await fetch(`/api/usuarios/${usuarioDelete.id}`, {
//         method: "DELETE",
//       });

//       if (response.ok) {
//         await carregarUsuarios();
//         setDeleteDialogOpen(false);
//         setUsuarioDelete(null);
//         alert("Usuário desativado com sucesso!");
//       } else {
//         const error = await response.json();
//         alert(error.message || "Erro ao desativar usuário");
//       }
//     } catch (error) {
//       console.error("Erro ao desativar usuário:", error);
//       alert("Erro ao desativar usuário");
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
//             <Users className="h-8 w-8 text-emerald-600" />
//             <span>Gerenciamento de Usuários</span>
//           </h1>
//           <p className="text-muted-foreground mt-1">
//             Controle completo de usuários do sistema
//           </p>
//         </div>

//         <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//           <DialogTrigger asChild>
//             <Button className="bg-emerald-600 hover:bg-emerald-700">
//               <Plus className="h-4 w-4 mr-2" />
//               Novo Usuário
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="max-w-md">
//             <DialogHeader>
//               <DialogTitle>Adicionar Novo Usuário</DialogTitle>
//               <DialogDescription>
//                 Preencha os dados do novo usuário
//               </DialogDescription>
//             </DialogHeader>
//             <form onSubmit={handleCriarUsuario} className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="nome">Nome Completo *</Label>
//                 <Input
//                   id="nome"
//                   value={novoUsuario.nome}
//                   onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
//                   placeholder="Ex: João Silva"
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="email">Email *</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   value={novoUsuario.email}
//                   onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
//                   placeholder="usuario@exemplo.com"
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="senha">Senha *</Label>
//                 <Input
//                   id="senha"
//                   type="password"
//                   value={novoUsuario.senha}
//                   onChange={(e) => setNovoUsuario({ ...novoUsuario, senha: e.target.value })}
//                   placeholder="Mínimo 6 caracteres"
//                   required
//                   minLength={6}
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="confirmarSenha">Confirmar Senha *</Label>
//                 <Input
//                   id="confirmarSenha"
//                   type="password"
//                   value={novoUsuario.confirmarSenha}
//                   onChange={(e) => setNovoUsuario({ ...novoUsuario, confirmarSenha: e.target.value })}
//                   placeholder="Digite a senha novamente"
//                   required
//                 />
//               </div>

//               <div className="flex justify-end space-x-2 pt-4">
//                 <Button type="button" variant="outline" onClick={() => {
//                   setDialogOpen(false);
//                   resetForm();
//                 }}>
//                   Cancelar
//                 </Button>
//                 <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
//                   Criar Usuário
//                 </Button>
//               </div>
//             </form>
//           </DialogContent>
//         </Dialog>
//       </div>

//       {/* Busca */}
//       <Card>
//         <CardContent className="pt-6">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//             <Input
//               placeholder="Buscar por nome ou email..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="pl-10"
//             />
//           </div>
//         </CardContent>
//       </Card>

//       {/* Lista de Usuários */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Usuários Cadastrados</CardTitle>
//           <CardDescription>
//             {filteredUsuarios.length} usuário(s) encontrado(s)
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           {loading ? (
//             <div className="text-center py-8 text-slate-500">Carregando...</div>
//           ) : filteredUsuarios.length === 0 ? (
//             <div className="text-center py-8 text-slate-500">Nenhum usuário encontrado</div>
//           ) : (
//             <ScrollArea className="h-[600px] pr-4">
//               <div className="space-y-3">
//                 {filteredUsuarios.map((usuario) => (
//                   <Card key={usuario.id} className="hover:shadow-md transition-shadow">
//                     <CardContent className="p-4">
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center space-x-4">
//                           <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold ${
//                             usuario.ativo ? "bg-emerald-600" : "bg-gray-400"
//                           }`}>
//                             {usuario.nome.charAt(0).toUpperCase()}
//                           </div>
//                           <div className="space-y-1">
//                             <div className="flex items-center space-x-2">
//                               <h3 className="font-semibold">{usuario.nome}</h3>
//                               <Badge variant={usuario.ativo ? "default" : "secondary"}>
//                                 {usuario.ativo ? (
//                                   <><UserCheck className="h-3 w-3 mr-1" /> Ativo</>
//                                 ) : (
//                                   <><UserX className="h-3 w-3 mr-1" /> Inativo</>
//                                 )}
//                               </Badge>
//                             </div>
//                             <p className="text-sm text-muted-foreground">{usuario.email}</p>
//                             <p className="text-xs text-muted-foreground">
//                               Cadastrado em: {format(new Date(usuario.criadoEm), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
//                             </p>
//                           </div>
//                         </div>
//                         <div className="flex items-center space-x-1">
//                           <Button
//                             size="sm"
//                             variant="ghost"
//                             onClick={() => abrirDetalhes(usuario)}
//                             className="text-slate-600 hover:text-slate-700 hover:bg-slate-50"
//                           >
//                             <Eye className="h-4 w-4" />
//                           </Button>
//                           <Button
//                             size="sm"
//                             variant="ghost"
//                             onClick={() => abrirEdicao(usuario)}
//                             className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
//                           >
//                             <Edit className="h-4 w-4" />
//                           </Button>
//                           {usuario.ativo && (
//                             <Button
//                               size="sm"
//                               variant="ghost"
//                               onClick={() => confirmarDelete(usuario)}
//                               className="text-red-600 hover:text-red-700 hover:bg-red-50"
//                             >
//                               <Trash2 className="h-4 w-4" />
//                             </Button>
//                           )}
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             </ScrollArea>
//           )}
//         </CardContent>
//       </Card>

//       {/* Dialog de Edição */}
//       <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle>Editar Usuário</DialogTitle>
//             <DialogDescription>
//               Modifique os dados do usuário (deixe a senha em branco para não alterar)
//             </DialogDescription>
//           </DialogHeader>
//           <form onSubmit={handleEditarUsuario} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="edit-nome">Nome Completo *</Label>
//               <Input
//                 id="edit-nome"
//                 value={novoUsuario.nome}
//                 onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
//                 placeholder="Ex: João Silva"
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="edit-email">Email *</Label>
//               <Input
//                 id="edit-email"
//                 type="email"
//                 value={novoUsuario.email}
//                 onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
//                 placeholder="usuario@exemplo.com"
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="edit-senha">Nova Senha (opcional)</Label>
//               <Input
//                 id="edit-senha"
//                 type="password"
//                 value={novoUsuario.senha}
//                 onChange={(e) => setNovoUsuario({ ...novoUsuario, senha: e.target.value })}
//                 placeholder="Deixe em branco para não alterar"
//                 minLength={6}
//               />
//             </div>

//             {novoUsuario.senha && (
//               <div className="space-y-2">
//                 <Label htmlFor="edit-confirmarSenha">Confirmar Nova Senha</Label>
//                 <Input
//                   id="edit-confirmarSenha"
//                   type="password"
//                   value={novoUsuario.confirmarSenha}
//                   onChange={(e) => setNovoUsuario({ ...novoUsuario, confirmarSenha: e.target.value })}
//                   placeholder="Digite a senha novamente"
//                   required
//                 />
//               </div>
//             )}

//             <div className="flex justify-end space-x-2 pt-4">
//               <Button type="button" variant="outline" onClick={() => {
//                 setEditDialogOpen(false);
//                 setUsuarioEdit(null);
//                 resetForm();
//               }}>
//                 Cancelar
//               </Button>
//               <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
//                 Salvar Alterações
//               </Button>
//             </div>
//           </form>
//         </DialogContent>
//       </Dialog>

//       {/* Dialog de Detalhes */}
//       <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle>Detalhes do Usuário</DialogTitle>
//           </DialogHeader>
//           {usuarioDetails && (
//             <div className="space-y-4">
//               <div className="flex items-center space-x-4">
//                 <div className={`h-16 w-16 rounded-full flex items-center justify-center text-white text-2xl font-bold ${
//                   usuarioDetails.ativo ? "bg-emerald-600" : "bg-gray-400"
//                 }`}>
//                   {usuarioDetails.nome.charAt(0).toUpperCase()}
//                 </div>
//                 <div>
//                   <h3 className="font-bold text-lg">{usuarioDetails.nome}</h3>
//                   <p className="text-sm text-muted-foreground">{usuarioDetails.email}</p>
//                 </div>
//               </div>

//               <div className="border-t pt-4 space-y-3">
//                 <div>
//                   <Label className="text-xs text-muted-foreground">Status</Label>
//                   <p className="font-medium">
//                     <Badge variant={usuarioDetails.ativo ? "default" : "secondary"}>
//                       {usuarioDetails.ativo ? "Ativo" : "Inativo"}
//                     </Badge>
//                   </p>
//                 </div>

//                 <div>
//                   <Label className="text-xs text-muted-foreground">Cadastrado em</Label>
//                   <p className="font-medium">
//                     {format(new Date(usuarioDetails.criadoEm), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
//                   </p>
//                 </div>

//                 {usuarioDetails.criador && (
//                   <div>
//                     <Label className="text-xs text-muted-foreground">Criado por</Label>
//                     <p className="font-medium">{usuarioDetails.criador.nome}</p>
//                     <p className="text-sm text-muted-foreground">{usuarioDetails.criador.email}</p>
//                   </div>
//                 )}

//                 {usuarioDetails.usuariosCriados && usuarioDetails.usuariosCriados.length > 0 && (
//                   <div>
//                     <Label className="text-xs text-muted-foreground">
//                       Usuários criados por este usuário ({usuarioDetails.usuariosCriados.length})
//                     </Label>
//                     <div className="mt-2 space-y-1">
//                       {usuarioDetails.usuariosCriados.map((u) => (
//                         <div key={u.id} className="text-sm p-2 bg-slate-50 rounded flex items-center justify-between">
//                           <span>{u.nome}</span>
//                           <Badge variant={u.ativo ? "default" : "secondary"} className="text-xs">
//                             {u.ativo ? "Ativo" : "Inativo"}
//                           </Badge>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <div className="flex justify-end pt-4 border-t">
//                 <Button onClick={() => setDetailsDialogOpen(false)}>
//                   Fechar
//                 </Button>
//               </div>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* AlertDialog de Confirmação de Desativação */}
//       <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Confirmar Desativação</AlertDialogTitle>
//             <AlertDialogDescription>
//               Tem certeza que deseja desativar este usuário? O usuário não será removido do banco de dados,
//               apenas marcado como inativo e não poderá mais acessar o sistema.
//               {usuarioDelete && (
//                 <div className="mt-4 p-3 bg-slate-100 rounded">
//                   <p className="font-semibold">{usuarioDelete.nome}</p>
//                   <p className="text-sm">{usuarioDelete.email}</p>
//                 </div>
//               )}
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancelar</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={handleDesativar}
//               className="bg-red-600 hover:bg-red-700"
//             >
//               Confirmar Desativação
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { usePermission } from "@/hooks/usePermission";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function UsuariosPage() {
  const { can } = usePermission();
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado para novo utilizador
  const [novoUser, setNovoUser] = useState({ nome: "", email: "", senha: "", roleId: "" });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [resUsers, resRoles] = await Promise.all([
      fetch("/api/usuarios"),
      fetch("/api/roles") // Precisas de criar esta API simples para listar roles
    ]);
    setUsuarios(await resUsers.json());
    setRoles(await resRoles.json());
    setLoading(false);
  }

  async function handleCriar() {
    const res = await fetch("/api/usuarios", {
      method: "POST",
      body: JSON.stringify(novoUser),
    });

    if (res.ok) {
      toast.success("Utilizador criado!");
      fetchData();
    } else {
      toast.error("Erro ao criar utilizador.");
    }
  }

  if (!can("utilizadores.ver")) return <p>Acesso negado.</p>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestão de Utilizadores</h1>
        
        {can("utilizadores.criar") && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>Novo Utilizador</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Adicionar Utilizador</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <Input placeholder="Nome" onChange={e => setNovoUser({...novoUser, nome: e.target.value})} />
                <Input placeholder="Email" onChange={e => setNovoUser({...novoUser, email: e.target.value})} />
                <Input type="password" placeholder="Senha" onChange={e => setNovoUser({...novoUser, senha: e.target.value})} />
                <Select onValueChange={val => setNovoUser({...novoUser, roleId: val})}>
                  <SelectTrigger><SelectValue placeholder="Selecione o Nível" /></SelectTrigger>
                  <SelectContent>
                    {roles.map(r => <SelectItem key={r.id} value={r.id}>{r.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button className="w-full" onClick={handleCriar}>Guardar</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Nível (Role)</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usuarios.map((u: any) => (
            <TableRow key={u.id}>
              <TableCell>{u.nome}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>
                {u.roles.map((ur: any) => (
                  <Badge key={ur.roleId} variant="outline" className="mr-1">
                    {ur.role.nome}
                  </Badge>
                ))}
              </TableCell>
              <TableCell>
                <Badge variant={u.ativo ? "default" : "destructive"}>
                  {u.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
