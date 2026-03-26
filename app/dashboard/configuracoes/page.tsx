"use client";

import { useState } from "react";
import { Search, Cog,UserCog, Calendar, KeyRound, UserCircle,Menu} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import UsuariosPage from "@/app/dashboard/usuarios/page";
import PeriodosPage from "@/app/dashboard/periodos/page"; 
import PapeisPage from "@/app/dashboard/papeis/page"; 
import MeuPerfil from "@/app/dashboard/perfil/page";
import {ConteudoSidebar} from "@/app/dashboard/configuracoes/components/sideBar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

// Define os itens do menu com componente React correcto
const menuItems = [
  {
    id: "perfil",
    nome: "Meu Perfil",
    icone: UserCircle,
    componente: <MeuPerfil/>,
  },
  {
    id: "usuarios",
    nome: "Gerir Utilizadores",
    icone:  UserCog,
    componente: <UsuariosPage />,
  },
  {
    id: "papeis",
    nome: "Perfis e Permissões",
    icone: KeyRound, 
    componente: <PapeisPage />, 
  },
  {
    id: "periodos",
    nome: "Configurar Períodos",
    icone: Calendar,
    componente: <PeriodosPage />, 
  },
];

export default function ConfiguracoesPage() {
  const [pesquisa, setPesquisa] = useState("");
  const [activo, setActivo] = useState<string>(""); // id do item activo

  // Filtra os ite 
  //u ns do menu pela pesquisa
  const itensFiltrados = menuItems.filter((item) =>
    item.nome.toLowerCase().includes(pesquisa.toLowerCase())
  );

  // Componente activo actual
  const paginaActiva = menuItems.find((item) => item.id === activo);

  return (
    <ScrollArea className="h-[600px] overflow-scroll-y-hidden">
      <div className="space-y-6">
      <div className="flex h-full">

    {/* --- SIDEBAR MOBILE --- */}
    <div className="md:hidden fixed top-4 left-4 z-50">
      <Sheet>
        <SheetTrigger asChild className="right">
          <Button variant="outline" size="icon">
            <Cog className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
          <ConteudoSidebar 
            pesquisa={pesquisa} 
            setPesquisa={setPesquisa}
            itensFiltrados={itensFiltrados}
            activo={activo}
            setActivo={setActivo}
          />
        </SheetContent>
      </Sheet>
    </div>

    {/* --- SIDEBAR DESKTOP --- */}
    <aside className="hidden md:flex w-64 shrink-0 bg-sidebar h-full flex-col border-r border-border">
      <ConteudoSidebar 
        pesquisa={pesquisa} 
        setPesquisa={setPesquisa}
        itensFiltrados={itensFiltrados}
        activo={activo}
        setActivo={setActivo}
      />
    </aside>

        {/* Área de conteúdo */}
        <div className="flex-1 overflow-y-auto md:p-4">
          {paginaActiva ? (
            paginaActiva.componente
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Cog className="h-12 w-12 mb-4 opacity-30" />
              <p>Seleciona uma configuração no menu lateral.</p>
            </div>
          )}
        </div>

      </div>
    </div>
    </ScrollArea>
    
  );
}