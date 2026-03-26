import React from 'react';

interface LinhaBalancoProps {
  designacao: string;
  nota?: string;
  atual?: number;
  anterior?: number;
  isHeader?: boolean;
  isTotal?: boolean;
  className?: string;
}

const LinhaBalanco: React.FC<LinhaBalancoProps> = ({ 
  designacao, nota, atual, anterior, isHeader = false, isTotal = false, className = "" 
}) => {
  const textClass = isHeader || isTotal ? "font-bold" : "";
  
  const formatarKz = (valor?: number) => {
    if (valor === undefined || valor === 0) return ""; 
    return valor.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    /* items-stretch é vital para a linha vertical não quebrar */
    <div className={`flex items-stretch w-full text-[12px] font-mono leading-tight ${className}`}>
      
      {/* 1. Designação */}
      <div className={`flex flex-grow items-end min-w-0 pr-1 pl-3 py-1.5 ${textClass}`}>
        <span className="whitespace-nowrap truncate">{designacao}</span>
        {
          !isHeader &&(
             <div className="flex-grow border-b border-dotted border-black mx-1 mb-[2px]"></div>
          )
        }
      </div>

      {/* LINHA VERTICAL 1: Entre Designação e Notas */}
      <div className="w-12 text-center border-l border-black flex items-end justify-center py-1.5">
        <span className={textClass}>{nota}</span>
      </div>

      {/* LINHA VERTICAL 2: Entre Notas e Atual */}
      <div className="w-32 text-right border-l border-black flex items-end justify-end px-3 py-1.5">
        <span className={textClass}>{formatarKz(atual)}</span>
      </div>

      {/* LINHA VERTICAL 3: Entre Atual e Anterior */}
      <div className="w-32 text-right border-l border-black flex items-end justify-end px-3 py-1.5">
        <span className={textClass}>{formatarKz(anterior)}</span>
      </div>
    </div>
  );
};

export default function BalancoPDF(balanco:any) {
  const anoAtual = 2025;
  const anoAnterior = 2024;

  return (
    <div className="bg-gray-100 p-8 min-h-screen flex justify-center print:p-0 print:bg-white font-mono">
      <div className="bg-white w-[210mm] min-h-[297mm] p-12 shadow-2xl print:shadow-none print:w-full">
        
         {/* Cabeçalho do Documento */}
        <div className="text-left mb-6 text-[11px]">
          <p>Empresa: Fármacos Xeque-Mate<span className="w-3/4 inline-block ml-1"></span></p>
          <div className="flex justify-between mt-2">
            <p>Demonstração de resultados em: <span className="font-bold">31/12/{anoAtual}</span></p>
            <p>Valores expressos em: <span className="font-bold">Kwanzas (Kz)</span></p>
          </div>
        </div>

        {/* --- CONTENTOR DA TABELA (O "CAIXOTE" EXTERNO) --- */}
        <div className="border-2 border-black flex flex-col">
          
          {/* Cabeçalho da Tabela */}
          <div className="flex items-stretch border-b-2 border-black font-bold text-[11px] uppercase text-center bg-gray-50/50">
            <div className="flex-1 py-4 pl-3 flex items-center justify-center">Designação</div>
            <div className="w-12 border-l-2 border-black flex items-center justify-center text-center">Notas</div>
            <div className="w-64 border-l-2 border-black flex flex-col">
              <div className="py-2 border-b-2 border-black text-center">Exercícios</div>
              <div className="flex h-full">
                <div className="flex-1 border-r-2 border-black flex items-center justify-center">{anoAtual}</div>
                <div className="flex-1 flex items-center justify-center">{anoAnterior}</div>
              </div>
            </div>
          </div>

          {/* CORPO DO BALANÇO */}
          <div className="flex flex-col">
            {/* Bloco ACTIVO */}
            <LinhaBalanco designacao="Activo" isHeader className="mt-2" />
            <LinhaBalanco designacao="Activos não correntes:" isHeader className="pl-6" />
            <div className="pl-4">
                <LinhaBalanco designacao="Imobilizações corpóreas" nota="4" atual={1200000} anterior ={122929}/>
                <LinhaBalanco designacao="Imobilizações incorpóreas" nota="5" atual={500000} />
                <LinhaBalanco designacao="Investimentos financeiros" nota="6" />
                <LinhaBalanco designacao="Outros activos não correntes" nota="9" />
            </div>

            <div className="h-4"></div> {/* Espaço sem quebrar as linhas verticais externas */}

            <LinhaBalanco designacao="Activos correntes:" isHeader className="pl-6" />
            <div className="pl-4">
                <LinhaBalanco designacao="Existências" nota="8" atual={450000} />
                <LinhaBalanco designacao="Contas a receber" nota="9" atual={280000} />
                <LinhaBalanco designacao="Disponibilidades" nota="10" atual={75000} />
            </div>

            <LinhaBalanco designacao="TOTAL DO ACTIVO" isTotal className="bg-gray-50/50 mt-4" />
             <div className="h-4"></div>
           <LinhaBalanco designacao="Capital próprio e passivo" isHeader className="mt-2" />
            {/* Bloco CAPITAL PRÓPRIO E PASSIVO */}
            <LinhaBalanco designacao="Capital Próprio:" isHeader className="mt-2 pl-6" />
            <div className="pl-4">
                <LinhaBalanco designacao="Capital Social" nota="12" atual={1000000} />
                <LinhaBalanco designacao="Reservas" nota="13" atual={250000} />
                <LinhaBalanco designacao="Resultados Transitados" nota="14" />
                <LinhaBalanco designacao="Resultado Líquido do Exercício" atual={300000} />
            </div>

            <div className="h-4"></div>

            <LinhaBalanco designacao="Passivo não corrente:" isHeader className="pl-6" />
            <div className="pl-4">
                <LinhaBalanco designacao="Empréstimos de médio e longo prazos" nota="15" atual={400000} />
                <LinhaBalanco designacao="Outros passivos não correntes" nota="19" />
            </div>

            <div className="h-4"></div>

            <LinhaBalanco designacao="Passivo corrente:" isHeader className="pl-6" />
            <div className="pl-4">
                <LinhaBalanco designacao="Contas a pagar" nota="19" atual={180000} />
                <LinhaBalanco designacao="Outros passivos correntes" nota="21" />
            </div>

            <LinhaBalanco designacao="TOTAL DO CAPITAL PRÓPRIO E PASSIVO" isTotal className="bg-gray-50/50 mt-4" />
          </div>

        </div>

        {/* Assinaturas */}
        <div className="mt-20 flex justify-between px-16 text-[10px] font-bold uppercase">
          <div className="text-center">
            <div className="border-t border-black w-48 mb-2"></div>
            O Técnico de Contas n.º ________
          </div>
          <div className="text-center">
            <div className="border-t border-black w-48 mb-2"></div>
            A Direcção
          </div>
        </div>

      </div>
    </div>
  );
}



// "use client";
// import { useEffect, useState } from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { format } from "date-fns";
// import { ptBR } from "date-fns/locale";
// import { usePDF } from "react-to-pdf";
// import { Printer, FileText, Trash2, Download,Loader2 } from "lucide-react";

// // --- Tipagens ---
// interface ItemContabil {
//   codigo: string;
//   designacao: string;
//   valor: number;
// }

// interface DadosBalanco {
//   ativo: ItemContabil[];
//   passivo: ItemContabil[];
//   capitalProprio: ItemContabil[];
// }

// // --- Componente de Linha de Tabela ---
// const LinhaRelatorio = ({ 
//   item, 
//   nota, 
//   onNotaChange 
// }: { 
//   item: ItemContabil; 
//   nota: string; 
//   onNotaChange: (val: string) => void 
// }) => (
//   <div className="grid grid-cols-12 border-b border-black hover:bg-slate-50 group relative">
//     {/* Designação */}
//     <div className="col-span-7 px-2 py-1 border-r border-black text-[11px]">
//       {item.designacao}
//     </div>

//     {/* Nota (Opcional) */}
//     <div className="col-span-1 px-1 py-1 border-r border-black text-center text-[10px] font-bold flex items-center justify-center relative">
//       <span>{nota}</span>
      
//       {/* Input de edição (Escondido no PDF via 'print:hidden') */}
//       <input
//         type="text"
//         value={nota}
//         onChange={(e) => onNotaChange(e.target.value)}
//         className="absolute inset-0 w-full h-full opacity-0 focus:opacity-100 bg-blue-50 text-center border-none outline-none print:hidden transition-opacity"
//         placeholder="Nº"
//       />
//     </div>

//     {/* Valor em Kwanza */}
//     <div className="col-span-4 px-2 py-1 text-right text-[11px] tabular-nums">
//       {item.valor.toLocaleString("pt-AO", { minimumFractionDigits: 2 })}
//     </div>
//   </div>
// );

// type Exercicio = {
//   id: string;
//   nome: string;
//   dataInicio: string;
//   dataFim: string;
//   fechado: boolean;
// };

// export default function PaginaBalanco() {
//   // 1. Estados
//   const [notas, setNotas] = useState<Record<string, string>>({});
//   const [exercicios, setExercicios] = useState<Exercicio[]>([]);
//   const [exercicioSelecionado, setExercicioSelecionado] = useState<Exercicio | null>(null);
//   const [dataFim, setDataFim] = useState<string>("");
//   const [dadosRelatorio, setDadosRelatorio] = useState<any>(null);
//   const [loading, setLoading] = useState(false);

// useEffect(() => {
//     carregarExercicios();
//   }, []);

//   // ============ PREENCHER DATAS AO SELECIONAR EXERCÍCIO ============
//   useEffect(() => {
//     if (exercicioSelecionado) {
//       setDataFim(format(new Date(exercicioSelecionado.dataFim), "yyyy-MM-dd"));
//     }
//   }, [exercicioSelecionado, exercicios]);

//   const carregarExercicios = async () => {
//     try {
//       const res = await fetch("/api/periodos");
//       const data = await res.json();
//       const exerciciosArray = (data.periodos || [])
//         .filter((p: any) => p.tipo === "EXERCICIO")
//         .sort((a: any, b: any) => new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime());
//       setExercicios(exerciciosArray);
//     } catch (error) {
//       console.error("Erro ao carregar exercícios:", error);
//     }
//   };

//   const gerarRelatorio = async () => {
//     if (!exercicioSelecionado) {
//       alert("Selecione um exercício fiscal.");
//       return;
//     }

//     setLoading(true);
//     try {
//       const params = new URLSearchParams({
//         ...(exercicioSelecionado && { exercicioId: exercicioSelecionado.id }),
//         dataFim,
//         ...(contaId && { contaId }),
//       });

//       const res = await fetch(`/api/relatorios/balanco?${params.toString()}`);
//       const data = await res.json();
//       setDadosRelatorio(data);
//     } catch (error) {
//       console.error("Erro ao gerar relatório:", error);
//       alert("Erro ao gerar relatório");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const exportarPDF = async () => {
//     if (!dadosRelatorio) return;
//     setLoading(true);
//     try {
//       const params = new URLSearchParams({
//     exercicioId: exercicioSelecionado?.id || "",
//     dataFim
//   });

//   // Abre o PDF gerado pelo servidor em uma nova aba para download
//   window.open(`/api/relatorios/razao/pdf?${params.toString()}`, "_blank");
//     } catch (error) {
//       console.error("Erro ao exportar PDF:", error);
//       alert("Erro ao exportar PDF");
//     } finally {
//       setLoading(false);
//     }
//   };


//   return (
//     <div className="p-8 bg-slate-100 min-h-screen">
//       {/* BARRA DE FERRAMENTAS (Não sai no PDF) */}
//       <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
//         <div>
//           <h1 className="text-xl font-bold text-slate-800">Balanço Patrimonial</h1>
//           <p className="text-xs text-slate-500">Clique na coluna "Nota" para editar os números.</p>
//         </div>
        
//         <div className="flex gap-2">
//           <button 
//             onClick={() => setNotas({})}
//             className="flex items-center px-3 py-2 text-xs bg-slate-200 hover:bg-red-100 text-slate-600 rounded transition-colors"
//           >
//             <Trash2 className="w-4 h-4 mr-1" /> Limpar Notas
//           </button>
          
//           <button 
//             onClick={() => toPDF()}
//             className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded shadow-md transition-all"
//           >
//             <Download className="w-4 h-4 mr-2" /> Exportar PDF
//           </button>
//         </div>
//       </div>

//       {/* ÁREA DE CAPTURA DO PDF */}
//       <div className="flex justify-center">
//         <div 
//           ref={targetRef} 
//           className="w-[210mm] bg-white p-[15mm] shadow-2xl border border-slate-200 text-black font-serif relative"
//         >
//           {/* Cabeçalho Oficial */}
//           <div className="text-center mb-8 border-b-2 border-black pb-4">
//             <h2 className="text-lg font-bold uppercase">Xeque-Mate Contabilidade, Lda</h2>
//             <p className="text-sm">Balanço Patrimonial em 31 de Dezembro de 2025</p>
//             <p className="text-[10px] text-gray-600">(Valores expressos em Kwanzas - Kz)</p>
//           </div>

//           {/* Tabela de Ativos */}
//           <section className="mb-8">
//             <div className="grid grid-cols-12 bg-slate-900 text-white font-bold text-[10px] uppercase">
//               <div className="col-span-7 px-2 py-1">Ativo</div>
//               <div className="col-span-1 px-1 py-1 text-center border-l border-white/20">Nota</div>
//               <div className="col-span-4 px-2 py-1 text-right border-l border-white/20">Valor Líquido</div>
//             </div>

//             {dados.ativo.map((item) => (
//               <LinhaRelatorio 
//                 key={item.codigo} 
//                 item={item} 
//                 nota={notas[item.codigo] || ""} 
//                 onNotaChange={(val) => setNotas(prev => ({ ...prev, [item.codigo]: val }))}
//               />
//             ))}

//             <div className="grid grid-cols-12 bg-slate-50 font-bold border-b-2 border-black">
//               <div className="col-span-8 px-2 py-2 text-xs uppercase">Total do Ativo</div>
//               <div className="col-span-4 px-2 py-2 text-right text-xs">
//                 {totalAtivo.toLocaleString("pt-AO", { minimumFractionDigits: 2 })}
//               </div>
//             </div>
//           </section>

//           {/* Rodapé de Segurança (Invisível na tela, aparece no PDF) */}
//           <div className="hidden print:flex justify-between items-center mt-20 pt-4 border-t border-slate-300 text-[9px] italic text-slate-500">
//             <span>Documento processado por computador - Software Xeque-Mate</span>
//             <span>Página 1 de 1</span>
//             <span>Hash: {Math.random().toString(36).substring(7).toUpperCase()}</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }