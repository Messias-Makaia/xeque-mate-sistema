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
    quantidade: number;
    handleDesativar: (e: React.FormEvent) => Promise<void>;
    loading: boolean;
}

export default function DeletarVarios({
    abrir,
    setAbrir,
    quantidade,
    handleDesativar,
    loading,
}: detalhesprops) {

    return (
        <AlertDialog open={abrir} onOpenChange={setAbrir}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Eliminação</AlertDialogTitle>
                    <AlertDialogDescription>
          Tem certeza que pretende eliminar {quantidade} de papeis? <br />
          Se houverem usuários vinculados a apenas um papel dos selecionados, os papeis
          não serão eliminados.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDesativar}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={loading}
                    >{loading ?
                    "A eliminar..." : "Confirmar Eliminação"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
