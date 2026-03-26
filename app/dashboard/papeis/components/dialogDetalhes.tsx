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
detalhesPapel: Role | null;
}


export default function Detalhes({
abrir,
setAbrir,
detalhesPapel,
}: detalhesprops) {

return (
<Dialog open={abrir} onOpenChange={setAbrir}>
<DialogContent className="max-w-md">
<DialogHeader>
<DialogTitle>Detalhes do Papel</DialogTitle>
</DialogHeader>
{detalhesPapel && (
<div className="space-y-4">
<div className="flex items-center space-x-4">
<div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold ${detalhesPapel.ativo ? detalhesPapel.nome ==="ADMIN" ? "bg-red-600":"bg-emerald-600" : "bg-gray-400"}`}>
{detalhesPapel.nome.charAt(0).toUpperCase()}
</div>
<div>
<h3 className="font-bold text-lg">{detalhesPapel.nome}</h3>
<p className="text-sm text-muted-foreground">{detalhesPapel.descricao}</p>
</div>
</div>

<div className="border-t pt-4 space-y-3">
{detalhesPapel.nome==="ADMIN"?
(<div>
<p className="font-medium">
Predefinição do sistema
</p>
</div>):
(<div>
<Label className="text-xs text-muted-foreground">Status</Label>
<p className="font-medium">
<Badge variant={detalhesPapel.ativo ? "default" : "secondary"}>
{detalhesPapel.ativo ? "Ativo" : "Inativo"}
</Badge>
</p>

<Label className="text-xs text-muted-foreground">Cadastrado em</Label>
<p className="font-medium">
{format(new Date(detalhesPapel.criadoEm), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
</p>
</div>)}

{detalhesPapel.criadopor && (
<div>
<Label className="text-xs text-muted-foreground">Criado por</Label>
<p className="font-medium">{detalhesPapel.criadopor.nome}</p>
<p className="text-sm text-muted-foreground">{detalhesPapel.criadopor.email}</p>
</div>
)}

{detalhesPapel.permissions && detalhesPapel.permissions.length > 0 && (
<div>
<Label className="text-xs text-muted-foreground">
Permissões vinculadas ao papel: ({detalhesPapel.permissions.length})
</Label>
<ScrollArea className="h-[200px]">
<div className="mt-2 space-y-1">
{detalhesPapel.permissions.map((p: RolePermission) => (
    <div key={p.permission.id} className="text-sm p-2 bg-slate-50 rounded flex items-center justify-between">
        <span>{p.permission.descricao}</span>
    </div>
))}
</div>
</ScrollArea>
</div>

)}
</div>

<div className="flex justify-end pt-4 border-t">
<Button onClick={() => setAbrir(false)} className={`${(detalhesPapel.nome==="ADMIN")&&"bg-red-600 hover:bg-red-700"}`}>
Fechar
</Button>
</div>
</div>
)}

</DialogContent>
</Dialog>
);
}