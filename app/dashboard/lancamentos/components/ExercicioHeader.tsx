"use client";

import { Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type StatusPeriodo = "ABERTO"|"FECHADO"|"REVISAO"|"AGUARDANDO";
const StatusPeriodo={
  ABERTO:"ABERTO",
  FECHADO:"FECHADO",
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

type Exercicio = {
  id: string;
  nome: string;
  fechado: boolean;
  dataInicio: string;
  dataFim: string;
  criadoEm: string;
  criadoporId: string;
  atualizadoporId: string;
  periodos: Periodo[];
}

interface ExercicioHeaderProps {
  exercicios: Exercicio[];
  exercicioSelecionado: Exercicio | null;
  onSelecionarExercicio: (exercicio: Exercicio) => void;
}

export default function ExercicioHeader({
  exercicios,
  exercicioSelecionado,
  onSelecionarExercicio,
}: ExercicioHeaderProps) {
  return (
    <Card>
      <CardContent className="pt-6 sm:flex flex-row">
        <div className="flex items-center space-x-4 sm: flex flex-col space-y-2">
          <div className="items-center flex flex-row gap-4">
            <div>
               <Calendar className="h-6 w-6 text-emerald-600 flex-shrink-0" />
            </div>
            <div className="w-full space-y-1">
            <label className="text-sm font-medium text-slate-600">Selecione o Exercício</label>
            <Select
              value={exercicioSelecionado?.id || ""}
              onValueChange={(id) => {
                const exer = exercicios.find((e) => e.id === id);
                if (exer) onSelecionarExercicio(exer);
              }}
            >
              <SelectTrigger className="pl-10">
                <SelectValue placeholder="Escolha um exercício" />
              </SelectTrigger>
              <SelectContent>
                {exercicios.map((exer) => (
                  <SelectItem key={exer.id} value={exer.id}>
                    <div className="flex items-center space-x-2">
                      <span>{exer.nome}</span>
                      {exer.fechado && <span className="text-xs text-orange-600">(Fechado)</span>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          </div>
          
          {exercicioSelecionado && (
            <div className="text-right text-sm text-slate-600">
              <p>
                {format(new Date(exercicioSelecionado.dataInicio), "dd/MM/yyyy", {
                  locale: ptBR,
                })}{" "}
                a{" "}
                {format(new Date(exercicioSelecionado.dataFim), "dd/MM/yyyy", {
                  locale: ptBR,
                })}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}