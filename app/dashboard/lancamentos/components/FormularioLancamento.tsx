"use client";

import { Plus, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Value } from "@radix-ui/react-select";

type StatusPeriodo = "ABERTO"|"FECHADO"|"REVISAO"|"AGUARDANDO";
const StatusPeriodo={
  ABERTO:"ABERTO",
  FECHADO:"FECHADO",
  REVISAO: "REVISAO",
  AGUARDANDO: "AGUARDANDO",
};

type ItemLancamento = {
  id?: string;
  contaContabilId: string;
  codigoConta?: string;
  nomeConta?: string;
  debito: string;
  credito: string;
  historico?: string;
};

type Conta = {
  id: string;
  codigo: string;
  nome: string;
  tipo: string;
  aceitaLancamento: boolean;
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

interface FormularioLancamentoProps {
  novoLancamento: any;
  setNovoLancamento: (state: any) => void;
  itens: ItemLancamento[];
  setItens: (items: ItemLancamento[]) => void;
  contas: Conta[];
  periodos: Periodo[];
  adicionarItem: () => void;
  removerItem: (index: number) => void;
  atualizarItem: (index: number, campo: keyof ItemLancamento, valor: string) => void;
  calcularTotais: () => { totalDebito: number; totalCredito: number; diferenca: number };
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isEditing: boolean;
  onCancel: () => void;
}

export default function FormularioLancamento({
  novoLancamento,
  setNovoLancamento,
  itens,
  adicionarItem,
  removerItem,
  atualizarItem,
  contas,
  periodos,
  calcularTotais,
  onSubmit,
  isEditing,
  onCancel,
}: FormularioLancamentoProps) {
  const { totalDebito, totalCredito, diferenca } = calcularTotais();
  const partidasValidas = Math.abs(diferenca) < 0.01 && totalDebito > 0;
  const p = periodos.find((p) => p.status === StatusPeriodo.ABERTO||p.status === StatusPeriodo.REVISAO);
  const per = () => {
     setNovoLancamento({ ...novoLancamento, periodoId: p?.id});
  }
 
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Informações Básicas */}
      <div className="space-y-4 sm: flex flex-col">
        <h3 className="font-semibold text-lg">Informações Básicas</h3>
        <div className="flex flex-col md:grid grid-cols-2 space-x-2">
          <div className="space-y-2">
            <Label htmlFor="data">Data *</Label>
            <Input
              id="data"
              type="date"
              value={novoLancamento.data}
              onChange={(e) => setNovoLancamento({ ...novoLancamento, data: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="documento">Nº Documento</Label>
            <Input
              id="documento"
              value={novoLancamento.documento}
              onChange={(e) => setNovoLancamento({ ...novoLancamento, documento: e.target.value })}
              placeholder="NF, Recibo, etc"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição/Histórico *</Label>
          <Textarea
            id="descricao"
            value={novoLancamento.descricao}
            onChange={(e) => setNovoLancamento({ ...novoLancamento, descricao: e.target.value })}
            placeholder="Histórico do lançamento"
            rows={2}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="periodo">Período Contábil</Label>
         <Input
         id="periodo"
         value={p?.nome ||"Nenhum periodo aberto"}        
         disabled={true}
         />
        </div>
      </div>

      {/* Itens do Lançamento */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Itens do Lançamento</h3>
          <Button type="button" onClick={adicionarItem} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            Adicionar Item
          </Button>
        </div>

        <ScrollArea className="h-[300px] border rounded-lg p-4">
          <div className="space-y-3 pr-4">
            {itens.map((item, index) => (
              <div key={index} className="flex gap-2 items-start p-3 bg-slate-50 rounded-lg">
                <div className="flex-1 space-y-2 sm:w-full">
                  <Select
                    value={item.contaContabilId}
                    onValueChange={(value) => {
                      const conta = contas.find((c) => c.id === value);
                      atualizarItem(index, "contaContabilId", value);
                      if (conta) {
                        atualizarItem(index, "codigoConta", conta.codigo);
                        atualizarItem(index, "nomeConta", conta.nome);
                      }
                    }}
                  >
                    <SelectTrigger
                    className="sm:pl-10"
                    >
                      <SelectValue placeholder="Selecione a conta" />
                    </SelectTrigger>
                    <SelectContent>
                      {contas.map((conta) => (
                        <SelectItem key={conta.id} value={conta.id}>
                          {conta.codigo} - {conta.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full md:w-32">
                  <Label className="text-xs">Débito</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.debito}
                    onChange={(e) => atualizarItem(index, "debito", e.target.value)}
                    className="text-right"
                  />
                </div>

                <div className="w-full md:w-32">
                  <Label className="text-xs">Crédito</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.credito}
                    onChange={(e) => atualizarItem(index, "credito", e.target.value)}
                    className="text-right"
                  />
                </div>

                {itens.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removerItem(index)}
                    className="mt-5 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Totalizadores */}
      <Card className={partidasValidas ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"}>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                {partidasValidas ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-semibold">
                  {partidasValidas ? "Partidas Dobradas Válidas" : "Partidas Dobradas Inválidas"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {partidasValidas
                  ? "Débito = Crédito (método das partidas dobradas)"
                  : "Débito deve ser igual ao Crédito"}
              </p>
            </div>
            <div className="text-right space-y-1">
              <div className="text-sm">
                <span className="text-muted-foreground">Total Débito:</span>{" "}
                <span className="font-bold">{totalDebito.toFixed(2)} Kz</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Total Crédito:</span>{" "}
                <span className="font-bold">{totalCredito.toFixed(2)} Kz</span>
              </div>
              {!partidasValidas && diferenca !== 0 && (
                <div className="text-sm text-red-600 font-semibold">
                  Diferença: {Math.abs(diferenca).toFixed(2)} Kz
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observações */}
      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={novoLancamento.observacoes}
          onChange={(e) => setNovoLancamento({ ...novoLancamento, observacoes: e.target.value })}
          placeholder="Observações adicionais (opcional)"
          rows={2}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          className={isEditing ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-600 hover:bg-emerald-700"}
          disabled={!partidasValidas}
          onClick={per}
        >
          {isEditing ? "Salvar Alterações" : "Criar Lançamento"}
        </Button>
      </div>
    </form>
  );
}