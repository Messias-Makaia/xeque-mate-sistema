"use client";

import { useState } from "react";
import { Search, Cog, Users, Calendar} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import UsuariosPage from "@/app/dashboard/usuarios/page";
import PeriodosPage from "@/app/dashboard/periodos/page"; // ajusta o caminho
import { cn } from "@/lib/utils";

// Define os itens do menu com componente React correcto
const menuItems = [
  {
    id: "usuarios",
    nome: "Gerir Utilizadores",
    icone: Users,
    componente: <UsuariosPage />,
  },
  {
    id: "periodos",
    nome: "Configurar Períodos",
    icone: Calendar,
    componente: <PeriodosPage />, // substitui pelo teu componente real
  },
];

export default function ConfiguracoesPage() {
  const [pesquisa, setPesquisa] = useState("");
  const [activo, setActivo] = useState<string>(""); // id do item activo

  // Filtra os itens do menu pela pesquisa
  const itensFiltrados = menuItems.filter((item) =>
    item.nome.toLowerCase().includes(pesquisa.toLowerCase())
  );

  // Componente activo actual
  const paginaActiva = menuItems.find((item) => item.id === activo);

  return (
    <div className="space-y-6">
      <div className="flex h-full">

        {/* Sidebar */}
        <div className="w-64 shrink-0 bg-sidebar h-full flex flex-col border-r border-border">
          
          {/* Header da sidebar */}
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
              {itensFiltrados.map((item) => {
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

              {/* Mensagem quando pesquisa não encontra nada */}
              {itensFiltrados.length === 0 && (
                <li className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma configuração encontrada.
                </li>
              )}
            </ul>
          </nav>
        </div>

        {/* Área de conteúdo */}
        <div className="flex-1 overflow-y-auto p-6">
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
  );
}