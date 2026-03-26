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

interface detalhesprops {
    abrir: boolean;
    setAbrir: (x: boolean) => void;
    papel: any;
    handleDesativar: (e: React.FormEvent) => Promise<void>;
    loading: boolean;
}

export default function DeletarRole({
    abrir,
    setAbrir,
    papel,/*  */
    handleDesativar,
    loading,
}: detalhesprops) {

    return (
        <AlertDialog open={abrir} onOpenChange={setAbrir}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Desativação</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tem a certeza que deseja eliminar este papel? Os usuários vinvulados ao papel perderão as permissões
                        {papel && (
                            <div className="mt-4 p-3 bg-slate-100 rounded">
                                <p className="font-semibold">{papel.nome}</p>
                                <p className="text-sm">{papel.descricao}</p>
                            </div>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDesativar}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={loading}
                    >{loading ?
                    "A deletar..." : "Confirmar Desativação"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
