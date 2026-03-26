import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState } from "react";
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

interface detalhesprops {
    abrir: boolean;
    setAbrir: (x: boolean) => void;
    onSubmit: (e: React.FormEvent) => Promise<void>;
    novoPapel:any;
    setNovoPapel: (x: any) => void;
    permissoes: Permission[] | null;
    permissoesSelecionadas: Permission[];
    setPermissoesSelecionadas: (p: Permission[]) => void;
}


export default function CriarRole({
    abrir,
    setAbrir,
    onSubmit,
    novoPapel,
    setNovoPapel,
    permissoes,
    permissoesSelecionadas,
    setPermissoesSelecionadas,
}: detalhesprops) {

    const selecionarPermissao = (p: Permission, a: boolean) => {
        if (a === false){
        setPermissoesSelecionadas(permissoesSelecionadas.filter((per)=> per.id!==p.id));
        }else{
        setPermissoesSelecionadas([p,...permissoesSelecionadas]);
        }
    }

    const cancelar = () => {
        setNovoPapel({
      nome:" ",
      descricao:" ",
      permissions:[],  
});
        setPermissoesSelecionadas([]);
        setAbrir(false);
    }
    return (
        <Dialog open={abrir} onOpenChange={setAbrir}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Novo perfil de usuário</DialogTitle>
                    <DialogDescription>
                        Configure o novo perfil
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-6">
                    {/* Informações Básicas */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Informações Básicas</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nome">Nome do novo Papel</Label>
                                <Input
                                    id="nome"
                                    value={novoPapel.nome}
                                    onChange={(e) => setNovoPapel({ ...novoPapel, nome: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="descricao">Descrição do Papel *</Label>
                                <Input
                                    id="descricao"
                                    value={novoPapel.descricao}
                                    placeholder={"Descreva o perfil que está a criar"}
                                    onChange={(e) => setNovoPapel({ ...novoPapel, descricao: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Itens do Lançamento */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg">Conceda permissões ao usuário</h3>
                            <Label htmlFor="permissoes">{permissoesSelecionadas.length} Permissões concedidas</Label>
                        </div>
                        <ScrollArea className="h-[300px] border rounded-lg p-4">
                            <div className="space-y-3 pr-4">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-2">Recurso</th>
                                            <th className="text-left p-2">Descrição</th>
                                             <th className="text-right p-2">Selecionar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            permissoes?.map((per: Permission, index: number) => {
                                                return(
                                                <tr key={index} className="border-b">
                                                    <td className="p-2 font-semibold">
                                                         <span>{per.recurso}</span>
                                                    </td>
                                                    <td className=" text-left p-2 font-semibold">
                                                        <span>{per.descricao}</span>
                                                    </td>
                                                    <td className="text-right p-3">
                                                       <Label htmlFor="permissao" className="cursor-pointer" />
                                                            <input
                                                                type="checkbox"
                                                                id="permissao"
                                                                checked={permissoesSelecionadas.includes(per)}
                                                                onChange={(e) => selecionarPermissao(per, e.target.checked)}
                                                                className="rounded"
                                                            />
                                                    </td>
                                                </tr>
                                            )})
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </ScrollArea>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={cancelar}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="bg-emerald-600 hover:bg-emerald-700"
                            disabled={permissoesSelecionadas.length <= 0}
                        >
                            Criar Perfil
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}