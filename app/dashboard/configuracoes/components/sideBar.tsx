"use client";

import { useState } from "react";
import { Search, Cog,UserCog, Calendar, KeyRound, UserCircle} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import UsuariosPage from "@/app/dashboard/usuarios/page";
import PeriodosPage from "@/app/dashboard/periodos/page"; 
import PapeisPage from "@/app/dashboard/papeis/page"; 
import MeuPerfil from "@/app/dashboard/perfil/page";
import { cn } from "@/lib/utils";

interface props{
    pesquisa:string;
    setPesquisa:(x:any)=> void; 
    itensFiltrados:any; 
    activo:any; 
    setActivo:any;
}

// Componente interno para não repetir código
export const ConteudoSidebar = ({ pesquisa, setPesquisa, itensFiltrados, activo, setActivo }:props) => (
    <div className="flex h-full flex-col">
        {/* Header */}
        <header className="p-4 border-b border-border">
            <h1 className="text-xl font-bold flex items-center gap-x-2">
                <Cog className="h-5 w-5" />
                <span>Configurações</span>
            </h1>
        </header>

        {/* Pesquisa */}
        <div className="p-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Pesquisar..."
                    value={pesquisa}
                    onChange={(e) => setPesquisa(e.target.value)}
                    className="pl-9 h-8 text-sm"
                />
            </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto px-2 pb-4">
            <ul className="space-y-1">
                {itensFiltrados.map((item:any) => {
                    const Icone = item.icone;
                    const estaActivo = activo === item.id;
                    return (
                        <li key={item.id}>
                            <Button
                                variant={estaActivo ? "default" : "ghost"}
                                className={cn(
                                    "w-full justify-start gap-x-2 text-sm",
                                    estaActivo && "bg-emerald-600 hover:bg-emerald-700 text-white"
                                )}
                                onClick={() => setActivo(item.id)}
                            >
                                <Icone className="h-4 w-4 shrink-0" />
                                {item.nome}
                            </Button>
                        </li>
                    );
                })}
            </ul>
        </nav>
    </div>
);


// {/* <div className="w-64 shrink-0 bg-sidebar h-full flex flex-col border-r border-border">

//     {/* Header da sidebar */}
//     <header className="p-4 border-b border-border">
//         <h1 className="text-xl font-bold flex items-center gap-x-2">
//             <Cog className="h-5 w-5" />
//             <span>Configurações</span>
//         </h1>
//     </header>

//     {/* Pesquisa */}
//     <div className="p-3">
//         <div className="relative">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//             <Input
//                 placeholder="Pesquisar..."
//                 value={pesquisa}
//                 onChange={(e) => setPesquisa(e.target.value)}
//                 className="pl-9 h-8 text-sm"
//             />
//         </div>
//     </div>

//     {/* Menu */}
//     <nav className="flex-1 overflow-y-auto px-2 pb-4">
//         <ul className="space-y-1">
//             {itensFiltrados.map((item:any) => {
//                 const Icone = item.icone;
//                 const estaActivo = activo === item.id;

//                 return (
//                     <li key={item.id}>
//                         <Button
//                             variant={estaActivo ? "default" : "ghost"}
//                             className={cn(
//                                 "w-full justify-start gap-x-2 text-sm",
//                                 estaActivo && "bg-emerald-600 hover:bg-emerald-700 text-white"
//                             )}
//                             onClick={() => setActivo(item.id)}
//                         >
//                             <Icone className="h-4 w-4 shrink-0" />
//                             {item.nome}
//                         </Button>
//                     </li>
//                 );
//             })}

//             {/* Mensagem quando pesquisa não encontra nada */}
//             {itensFiltrados.length === 0 && (
//                 <li className="text-sm text-muted-foreground text-center py-4">
//                     Nenhuma configuração encontrada.
//                 </li>
//             )}
//         </ul>
//     </nav>
// </div> */}