import React from 'react';

interface LinhaDRProps {
  designacao: string;
  nota?: string;
  atual?: number;
  anterior?: number;
  isHeader?: boolean;
  isTotal?: boolean;
  className?: string;
}

const LinhaDR: React.FC<LinhaDRProps> = ({ 
  designacao, nota, atual, anterior, isHeader = false, isTotal = false, className = "" 
}) => {
  const textClass = isHeader || isTotal ? "font-bold uppercase" : "";
  
  const formatarKz = (valor?: number) => {
    if (valor === undefined || valor === 0) return ""; 
    // Usamos parênteses para valores negativos, comum em DR
    const formatado = Math.abs(valor).toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return valor < 0 ? `(${formatado})` : formatado;
  };

  return (
    <div className={`flex items-stretch w-full text-[12px] font-mono leading-tight ${className}`}>
      {/* 1. Designação */}
      <div className={`flex flex-grow items-end min-w-0 pr-1 pl-3 py-1.5 ${textClass}`}>
        <span className="whitespace-nowrap truncate">{designacao}</span>
        <div className="flex-grow border-b border-dotted border-black/30 mx-1 mb-[3px]"></div>
      </div>

      {/* LINHA VERTICAL 1: Notas */}
      <div className="w-12 text-center border-l border-black flex items-end justify-center py-1.5">
        <span className={textClass}>{nota}</span>
      </div>

      {/* LINHA VERTICAL 2: Exercício Atual */}
      <div className="w-32 text-right border-l border-black flex items-end justify-end px-3 py-1.5">
        <span className={textClass}>{formatarKz(atual)}</span>
      </div>

      {/* LINHA VERTICAL 3: Exercício Anterior */}
      <div className="w-32 text-right border-l border-black flex items-end justify-end px-3 py-1.5">
        <span className={textClass}>{formatarKz(anterior)}</span>
      </div>
    </div>
  );
};

export default function DrePage() {
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

        {/* --- CONTENTOR DA TABELA --- */}
        <div className="border-2 border-black flex flex-col">
          
          {/* Cabeçalho da Tabela */}
          <div className="flex items-stretch border-b-2 border-black font-bold text-[11px] uppercase text-center bg-gray-50/50">
            <div className="flex-1 py-4 pl-3 flex items-center justify-center">Designação</div>
            <div className="w-12 border-l-2 border-black flex items-center justify-center">Notas</div>
            <div className="w-64 border-l-2 border-black flex flex-col">
              <div className="py-2 border-b-2 border-black text-center">Exercícios</div>
              <div className="flex h-full">
                <div className="flex-1 border-r-2 border-black flex items-center justify-center">{anoAtual}</div>
                <div className="flex-1 flex items-center justify-center">{anoAnterior}</div>
              </div>
            </div>
          </div>

          {/* CORPO DA DEMONSTRAÇÃO DE RESULTADOS */}
          <div className="flex flex-col py-2">
            <LinhaDR designacao="Vendas" nota="22" atual={5000000} />
            <LinhaDR designacao="Prestações de serviços" nota="23" atual={1200000} />
            <LinhaDR designacao="Custo das vendas" atual={-2500000} />
            
            <div className="h-4"></div>

            <LinhaDR designacao="Margem Bruta" isTotal className="bg-gray-50/50 border-y border-black/10" atual={3700000} />

            <div className="h-4"></div>

            <LinhaDR designacao="Outros proveitos operacionais" />
            <LinhaDR designacao="Custos de distribuição" atual={-300000} />
            <LinhaDR designacao="Custos administrativos" atual={-800000} />
            <LinhaDR designacao="Outros custos e perdas operacionais" />

            <div className="h-4"></div>

            <LinhaDR designacao="Resultados Operacionais" isTotal className="bg-gray-50/50 border-y border-black/10" atual={2600000} />

            <div className="h-4"></div>

            <LinhaDR designacao="Resultados financeiros" nota="31" atual={-150000} />
            <LinhaDR designacao="Resultados de filiais e associados" nota="32" />
            <LinhaDR designacao="Resultados não operacionais" nota="33" />

            <div className="h-4"></div>

            <LinhaDR designacao="Resultados antes de impostos" isTotal className="bg-gray-50/50 border-y border-black/10" atual={2450000} />

            <div className="h-4"></div>

            <LinhaDR designacao="Imposto sobre o rendimento" nota="35" atual={-612500} />

            <div className="h-4"></div>

            <LinhaDR designacao="Resultados líquidos das actividades correntes" isTotal className="bg-gray-50/50 border-y border-black/10" atual={1837500} />

            <div className="h-2"></div>

            <LinhaDR designacao="Resultados de operações em descontinuação" />
            <LinhaDR designacao="Efeitos das alterações de políticas contabilísticas" />
            <LinhaDR designacao="Resultados extraordinários" nota="34" />
            <LinhaDR designacao="Imposto sobre o rendimento" nota="35" />

            <div className="h-6"></div>

            {/* Resultado Líquido Final */}
            <LinhaDR designacao="Resultados Líquidos do exercício" isTotal className="bg-gray-100 border-t-2 border-black" atual={1837500} />
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