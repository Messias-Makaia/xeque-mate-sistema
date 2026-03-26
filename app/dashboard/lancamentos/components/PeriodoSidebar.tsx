"use client";

import { Lock, Calendar } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Item } from "@radix-ui/react-select";

type StatusPeriodo = "ABERTO" | "FECHADO" | "REVISAO" | "AGUARDANDO";
const StatusPeriodo = {
  ABERTO: "ABERTO",
  FECHADO: "FECHADO",
  REVISAO: "REVISAO",
  AGUARDANDO: "AGUARDANDO",
};

type Periodo = {
  id: string;
  nome: string;
  dataInicio: string;
  dataFim: string;
  periodoIndex: number;
  bloqueado: boolean;
  criadoEm: string;
  exercicioId: string;
  status: StatusPeriodo;
  atualizadoporId: string;
}

interface props {
  setPeriodo: (x: any) => void;
  periodos: any;
  periodo: any;
  periodoId: any;
  setPeriodoId: (x: any) => void;
}

// Componente interno para não repetir código
export const ConteudoSidebar = ({ setPeriodo, periodos, periodo, setPeriodoId, periodoId }: props) => (
  <div className="flex h-full flex-col">
    {/* Header */}
    <header className="p-4 border-b border-border">
      <h1 className="text-xl font-bold flex items-center gap-x-2">
        <Calendar className="h-5 w-5 text-emerald-600" />
        <span>Periodos</span>
      </h1>
    </header>
    {/* Menu */}
    <nav className="flex-1 overflow-y-auto px-2 pb-4">
      <ul className="space-y-1">
        {!(periodos.length === 0)&&<li>
          <Button
            variant={periodoId === "TODOS" ? "default" : "outline"}
            className={cn(
              "w-full justify-start",
              periodoId === "TODOS" &&
              "bg-emerald-600 text-white hover:bg-emerald-700"
            )}
            onClick={() => setPeriodoId("TODOS")}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <span className="text-sm">
                  Todos os lançamentos
                </span>
              </div>
            </div>
          </Button>
        </li>}
        {!(periodos.length === 0) && periodos.map((item: any) => {
          return (
            <li key={item.id}>
              <Button
                key={item.id}
                variant={periodoId === item.id ? "default" : "outline"}
                className={cn(
                  "w-full justify-start",
                  periodoId === item.id &&
                  "bg-emerald-600 text-white hover:bg-emerald-700"
                )}
                onClick={() => { setPeriodo(item); setPeriodoId(item.id) }}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono bg-emerald-500 px-1.5 py-0.5 rounded">
                      #{item.periodoIndex}
                    </span>
                    <span className="text-sm">
                      {item.nome}
                    </span>
                  </div>
                  {item.status === StatusPeriodo.FECHADO && (
                    <Lock className="h-4 w-4 text-orange-500 flex-shrink-0" />
                  )}
                </div>
              </Button>
            </li>
          );
        })}
      </ul>
    </nav>
  </div>
);
