"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Search, Edit, Trash2, Eye, UserCheck, UserX } from "lucide-react";
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

const estadoInicial = {
    id: "",
    email: "",
    nome: "messi",
    ativo: false,
    criadoEm: "",
    criadoPor: "",
    criador: null,
    roles: [],
};

export default function MeuPerfil() {
    const [loading, setLoading] = useState(false);
    const [perfil, setPerfil] = useState<Usuario>(estadoInicial);
    const [salvando, setSalvando] = useState(false);
    const { toast } = useToast();
    const [novaSenha, setNovaSenha] = useState({ senha: "", senhaActual: "", confirmarSenha: "" });
    const [aberto, setAberto] = useState(false);

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/usuarios/meuperfil`);
            if (response.ok) {
                const data = await response.json();
                setPerfil(data || null);
            } else {
                const data = await response.json();
                toast({
                    title: "Erro",
                    variant: "destructive",
                    description: data.message || "Ocorreu um erro inesperado"
                });
            }
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

    const onSubmit = async (e: React.FormEvent) => {
        if (!novaSenha) return;
        e.preventDefault();
        if (novaSenha.senha !== novaSenha.confirmarSenha) {
            toast({
                title: "Senhas não coincidem",
                variant: "destructive",
                description: "Por favor, verifique as senhas que digitou"
            });
            return;
        }

        if (novaSenha.senha.length < 6) {
            toast({
                title: "Senha muito curta",
                variant: "destructive",
                description: "A senha deve ter pelo menos 6 digitos"
            });
            return;
        }

        try {
             setSalvando(true);
            const response = await fetch("/api/usuarios/meuperfil", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    senha: novaSenha.senhaActual,
                    novaSenha: novaSenha.senha,
                }),
            });

            if (response.ok) {
                //await carregarDados();
                setAberto(false);
                setNovaSenha({ senha: "", senhaActual: "", confirmarSenha: "" });
                toast({
                    title: "Sucesso",
                    variant: "success",
                    description: "Senha actualizada com sucesso"
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
        } finally {
            setLoading(false);
            setSalvando(false);
        }
    }

    const cancelar = () => {
        setAberto(false);
        setNovaSenha({ senha: "", senhaActual: "", confirmarSenha: "" });
    }

    const toogle = () => {
        if (aberto) {
            setAberto(false);
            setNovaSenha({ senha: "", senhaActual: "", confirmarSenha: "" });
        } else setAberto(true);
    }

    return (
        <ScrollArea className="h-[600px]">
<div>
            {loading ? (
                <div className="text-center py-8 text-slate-500">Carregando Perfil...</div>
            ) : !perfil ? (
                <div className="text-center py-8 text-slate-500">Não encontramos seu perfil.</div>
            ) : (
                <div className="text-center justify-center">
                    <div>
                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-3 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-20 w-20 rounded-full flex items-center text-3xl justify-center text-white font-bold bg-emerald-600">
                                            {perfil.nome.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="">
                                            <h1 className="text-3xl font-bold tracking-tight flex items-center text-left space-x-2">
                                                <p>{perfil.nome}</p>
                                            </h1>
                                            <p className="text-sm text-left text-slate-500">{perfil.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-left text-muted-foreground">Perfis de acesso</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {perfil.roles.map((r) => {
                                        return (
                                            <Badge
                                                className={r.role.ativo ? "text-blue-600 bg-blue-100 hover:bg-blue-300 mr-2" : "text-slate-600 bg-blue-100"}
                                                key={r.role.id}
                                            >
                                                {r.role.nome}
                                            </Badge>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="text-center space-y-3 p-3 justify-center">
                        <div>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={toogle}
                            >Credenciais
                            </Button>
                        </div>
                        {aberto && (<div className="">
                            <form onSubmit={onSubmit} className="space-y-6 text-left">
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">Atualizar credenciais</h3>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="senha">Senha actual</Label>
                                            <Input
                                                id="senha"
                                                type="password"
                                                value={novaSenha.senhaActual}
                                                onChange={(e) => setNovaSenha({ ...novaSenha, senhaActual: e.target.value })}
                                                placeholder="senha actual"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="senha">Nova senha</Label>
                                            <Input
                                                id="senha"
                                                type="password"
                                                value={novaSenha.senha}
                                                onChange={(e) => setNovaSenha({ ...novaSenha, senha: e.target.value })}
                                                placeholder="Mínimo 6 caracteres"
                                                min="6"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-confirmarSenha">Confirmar nova senha</Label>
                                            <Input
                                                id="confirmarSenha"
                                                type="password"
                                                value={novaSenha.confirmarSenha}
                                                onChange={(e) => setNovaSenha({ ...novaSenha, confirmarSenha: e.target.value })}
                                                placeholder="Digite a senha novamente"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-2 pt-4 border-t">
                                    <Button type="button" variant="outline" onClick={cancelar}>
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-700"
                                        disabled={salvando}
                                    >
                                        {salvando ? "A actualizar" : "Atualizar"}
                                    </Button>
                                </div>
                            </form>
                        </div>)}
                    </div>
                </div>
            )}

        </div>
        </ScrollArea>
        
    );
}
