"use client";

import { useEffect, useState } from "react";
import {
  Download,
  Loader2,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { usePDF } from "react-to-pdf";

type Exercicio = {
  id: string;
  nome: string;
  dataInicio: string;
  dataFim: string;
  fechado: boolean;
};

type Conta = {
  id: string;
  codigo: string;
  nome: string;
  tipo: string;
  natureza: string;
  nivel: number;
};

export default function RazaoPage() {
const [exercicios, setExercicios] = useState<Exercicio[]>([]);
const [exercicioSelecionado, setExercicioSelecionado] = useState<Exercicio | null>(null);
const [dataInicio, setDataInicio] = useState<string>("");
const [dataFim, setDataFim] = useState<string>("");
const [contaId, setContaId] = useState<string>("");
const [dadosRelatorio, setDadosRelatorio] = useState<any>(null);
const [loading, setLoading] = useState(false);
const [contas, setContas] = useState<Conta[]>([]);
const { toPDF, targetRef } = usePDF(dadosRelatorio && {
    filename: `Razao_${dadosRelatorio.codigoConta}-${dadosRelatorio.nomeConta}_${new Date().toLocaleDateString('pt-AO')}.pdf`,
    page: {
      margin: 10,
    },
    canvas: {
      mimeType: 'image/jpeg',
      qualityRatio: 1 // 1 é a qualidade original. Aumente para 2 se o texto estiver embaçado.
    },
    overrides: {
      // Customizações diretas no objeto jsPDF se necessário
      pdf: {
        compress: true
      }
    }
  });

  useEffect(() => {
    carregarExercicios();
    carregarContas();
  }, []);

  // ============ PREENCHER DATAS AO SELECIONAR EXERCÍCIO ============
  useEffect(() => {
    if (exercicioSelecionado) {
      setDataInicio(format(new Date(exercicioSelecionado.dataInicio), "yyyy-MM-dd"));
      setDataFim(format(new Date(exercicioSelecionado.dataFim), "yyyy-MM-dd"));
    }
  }, [exercicioSelecionado, exercicios]);

  const carregarExercicios = async () => {
    try {
      const res = await fetch("/api/exercicios");
      const data = await res.json();
      const exerciciosArray = (data.exercicios || [])
        .sort((a: any, b: any) => new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime());
      setExercicios(exerciciosArray);
    } catch (error) {
      console.error("Erro ao carregar exercícios:", error);
    }
  };

  const carregarContas = async () => {
    try {
      const res = await fetch("/api/contas?ativas=true");
      const data = await res.json();
      setContas(data || []);
    } catch (error) {
      console.error("Erro ao carregar contas:", error);
    }
  };

  const gerarRelatorio = async () => {
    if (!exercicioSelecionado) {
      alert("Selecione um exercício fiscal.");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(exercicioSelecionado && { exercicioId: exercicioSelecionado.id }),
        dataInicio,
        dataFim,
        ...(contaId && { contaId }),
      });

      const res = await fetch(`/api/relatorios/razao?${params.toString()}`);
      const data = await res.json();
      setDadosRelatorio(data);
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      alert("Erro ao gerar relatório");
    } finally {
      setLoading(false);
    }
  };

  const exportarPDF = async () => {
    if (!dadosRelatorio) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
    exercicioId: exercicioSelecionado?.id || "",
    dataInicio,
    dataFim,
    contaId
  });

  // Abre o PDF gerado pelo servidor em uma nova aba para download
  window.open(`/api/relatorios/razao/pdf?${params.toString()}`, "_blank");
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      alert("Erro ao exportar PDF");
    } finally {
      setLoading(false);
    }
  };

  const RenderRazao = () => {
      if (!dadosRelatorio?.razao1) return null;
  
      return (
        <div className="">
          <h1 className="text-2xl font-bold mb-4 flex items-center space-x-2">
            Razão Xeque-Mate
          </h1>
          <span className="text-sm mb-4 block">
            Conta: {dadosRelatorio.codigoConta} - {dadosRelatorio.nomeConta} | Período: {format(new Date(dataInicio), "dd/MM/yyyy")} a {format(new Date(dataFim), "dd/MM/yyyy")}
          </span>
          <ScrollArea className="h-[600px]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Data</th>
                  <th className="text-left p-2">Descrição</th>
                  <th className="text-right p-2">Débito</th>
                  <th className="text-right p-2">Crédito</th>
                  <th className="text-right p-2">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {dadosRelatorio.razao1.map((movimento: any, index: number) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{format(new Date(movimento.data), "dd/MM/yyyy", { locale: ptBR })}</td>
                    <td className="p-2">{movimento.descricao}</td>
                    <td className="p-2 text-right">
                      {movimento.debito.toLocaleString("pt-AO", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2 text-right">
                      {movimento.credito.toLocaleString("pt-AO", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right font-semibold">
                      {movimento.saldo.toLocaleString("pt-AO", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </div>
      );
    };

    return (
    <div className="space-y-6">
          {/* Formulário de Parâmetros */}
          <Card>
            <CardHeader>
              <CardTitle>Parâmetros do Relatório</CardTitle>
              <CardDescription>Configure os filtros para gerar o relatório</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="exercicio">Exercício Fiscal</Label>
                      <Select
                        value={exercicioSelecionado?.id || ""}
                        onValueChange={(id) => {
                          const exer = exercicios.find((e) => e.id === id);
                          setExercicioSelecionado(exer || null);
                        }}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o exercício" />
                        </SelectTrigger>
                        <SelectContent>
                          {exercicios.map((exer) => (
                            <SelectItem key={exer.id} value={exer.id}>
                              {exer.nome} | {format(new Date(exer.dataInicio), "dd/MM/yyyy")} a {format(new Date(exer.dataFim), "dd/MM/yyyy")} {exer.fechado && "(Fechado)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dataInicio">Data Início</Label>
                      <Input
                        id="dataInicio"
                        type="date"
                        value={dataInicio}
                        onChange={(e) => setDataInicio(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dataFim">Data Fim</Label>
                      <Input
                        id="dataFim"
                        type="date"
                        value={dataFim}
                        onChange={(e) => setDataFim(e.target.value)}
                        required
                      />
                    </div>
                  <div className="space-y-2">
                    <Label htmlFor="conta">Conta</Label>
                    <Select value={contaId} onValueChange={setContaId} required>
                      <SelectTrigger>
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
              </div>
    
              <Button onClick={gerarRelatorio} disabled={loading} className="w-full md:w-auto">
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                Gerar Relatório
              </Button>
            </CardContent>
          </Card>
    
          {/* Resultados */}
          {dadosRelatorio && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Resultados</h2>
                <Button onClick={exportarPDF} disabled={loading} variant="outline">
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                  Exportar PDF
                </Button>
              </div>
              <div ref={targetRef} className="bg-white w-[210mm] min-h-[297mm] p-12 shadow-2xl print:shadow-none print:w-full">
                    <RenderRazao />
              </div>
            </div>
          )}
        </div>
    );
}