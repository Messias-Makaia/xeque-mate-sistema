// "use client";

// import { useEffect, useState } from "react";
// import { FileText, Plus, Calendar, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { format } from "date-fns";
// import { ptBR } from "date-fns/locale";

// type ItemLancamento = {
//   id?: string;
//   contaContabilId: string;
//   codigoConta?: string;
//   nomeConta?: string;
//   debito: string;
//   credito: string;
// };

// type Lancamento = {
//   id: string;
//   data: string;
//   descricao: string;
//   documento?: string | null;
//   tipo: string;
//   totalDebito: string;
//   totalCredito: string;
//   status: string;
//   observacoes?: string | null;
//   itens: ItemLancamento[];
// };

// type Conta = {
//   id: string;
//   codigo: string;
//   nome: string;
//   tipo: string;
//   aceitaLancamento: boolean;
// };

// export default function LancamentosPage() {
//   const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
//   const [contas, setContas] = useState<Conta[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [dialogOpen, setDialogOpen] = useState(false);

//   // Novo lançamento
//   const [novoLancamento, setNovoLancamento] = useState({
//     data: format(new Date(), "yyyy-MM-dd"),
//     descricao: "",
//     documento: "",
//     tipo: "NORMAL",
//     observacoes: "",
//   });

//   const [itens, setItens] = useState<ItemLancamento[]>([
//     { contaContabilId: "", debito: "0", credito: "0" },
//     { contaContabilId: "", debito: "0", credito: "0" },
//   ]);

//   useEffect(() => {
//     carregarDados();
//   }, []);

//   const carregarDados = async () => {
//     try {
//       const [lancResponse, contasResponse] = await Promise.all([
//         fetch("/api/lancamentos"),
//         fetch("/api/contas?ativas=true"),
//       ]);

//       const [lancData, contasData] = await Promise.all([
//         lancResponse.json(),
//         contasResponse.json(),
//       ]);

//       setLancamentos(lancData || []);
//       setContas((contasData || []).filter((c: Conta) => c.aceitaLancamento));
//     } catch (error) {
//       console.error("Erro ao carregar dados:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const calcularTotais = () => {
//     const totalDebito = itens.reduce((acc, item) => acc + parseFloat(item.debito || "0"), 0);
//     const totalCredito = itens.reduce((acc, item) => acc + parseFloat(item.credito || "0"), 0);
//     return { totalDebito, totalCredito, diferenca: totalDebito - totalCredito };
//   };

//   const adicionarItem = () => {
//     setItens([...itens, { contaContabilId: "", debito: "0", credito: "0" }]);
//   };

//   const removerItem = (index: number) => {
//     if (itens.length > 2) {
//       setItens(itens.filter((_, i) => i !== index));
//     }
//   };

//   // const atualizarItem = (index: number, campo: keyof ItemLancamento, valor: string) => {
//   //   const novosItens = [...itens];
//   //   novosItens[index] = { ...novosItens[index], [campo]: valor };
//   //   setItens(novosItens);
//   // };

//   const atualizarItem = (index: number, campo: keyof ItemLancamento, valor: string) => {
//   setItens((prevItens) => {
//     const novosItens = [...prevItens];
//     // Criamos uma cópia do objeto específico que está sendo alterado
//     novosItens[index] = { 
//       ...novosItens[index], 
//       [campo]: valor 
//     };
//     return novosItens;
//   });
// };

//   const handleCriarLancamento = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const { totalDebito, totalCredito, diferenca } = calcularTotais();

//     if (Math.abs(diferenca) > 0.01) {
//       alert("Partidas dobradas inválidas! Débito deve ser igual ao Crédito.");
//       return;
//     }

//     if (totalDebito === 0 || totalCredito === 0) {
//       alert("O lançamento deve ter valores de débito e crédito.");
//       return;
//     }

//     // Filtrar itens válidos
//     const itensValidos = itens.filter(
//       (item) => item.contaContabilId && (parseFloat(item.debito) > 0 || parseFloat(item.credito) > 0)
//     );

//     if (itensValidos.length < 2) {
//       alert("O lançamento deve ter pelo menos 2 itens.");
//       return;
//     }

//     try {
//       const response = await fetch("/api/lancamentos", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           ...novoLancamento,
//           itens: itensValidos,
//         }),
//       });

//       if (response.ok) {
//         await carregarDados();
//         setDialogOpen(false);
//         // Reset
//         setNovoLancamento({
//           data: format(new Date(), "yyyy-MM-dd"),
//           descricao: "",
//           documento: "",
//           tipo: "NORMAL",
//           observacoes: "",
//         });
//         setItens([
//           { contaContabilId: "", debito: "0", credito: "0" },
//           { contaContabilId: "", debito: "0", credito: "0" },
//         ]);
//         alert("Lançamento criado com sucesso!");
//       } else {
//         const error = await response.json();
//         alert(error.message || "Erro ao criar lançamento");
//       }
//     } catch (error) {
//       console.error("Erro ao criar lançamento:", error);
//       alert("Erro ao criar lançamento");
//     }
//   };

//   const { totalDebito, totalCredito, diferenca } = calcularTotais();
//   const partidasValidas = Math.abs(diferenca) < 0.01 && totalDebito > 0;
//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
//             <FileText className="h-8 w-8 text-emerald-600" />
//             <span>Lançamentos Contábeis</span>
//           </h1>
//           <p className="text-muted-foreground mt-1">
//             Registro de operações contábeis com método das partidas dobradas
//           </p>
//         </div>

//         <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//           <DialogTrigger asChild>
//             <Button className="bg-emerald-600 hover:bg-emerald-700">
//               <Plus className="h-4 w-4 mr-2" />
//               Novo Lançamento
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//             <DialogHeader>
//               <DialogTitle>Novo Lançamento Contábil</DialogTitle>
//               <DialogDescription>
//                 Preencha os dados do lançamento seguindo o método das partidas dobradas
//               </DialogDescription>
//             </DialogHeader>
//             <form onSubmit={handleCriarLancamento} className="space-y-6">
//               {/* Informações Básicas */}
//               <div className="space-y-4">
//                 <h3 className="font-semibold text-lg">Informações Básicas</h3>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="data">Data *</Label>
//                     <Input
//                       id="data"
//                       type="date"
//                       value={novoLancamento.data}
//                       onChange={(e) => setNovoLancamento({ ...novoLancamento, data: e.target.value })}
//                       required
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="documento">Nº Documento</Label>
//                     <Input
//                       id="documento"
//                       value={novoLancamento.documento}
//                       onChange={(e) => setNovoLancamento({ ...novoLancamento, documento: e.target.value })}
//                       placeholder="NF, Recibo, etc"
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="descricao">Descrição/Histórico *</Label>
//                   <Textarea
//                     id="descricao"
//                     value={novoLancamento.descricao}
//                     onChange={(e) => setNovoLancamento({ ...novoLancamento, descricao: e.target.value })}
//                     placeholder="Histórico do lançamento"
//                     rows={2}
//                     required
//                   />
//                 </div>
//               </div>

//               {/* Itens do Lançamento */}
//               <div className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <h3 className="font-semibold text-lg">Itens do Lançamento</h3>
//                   <Button type="button" onClick={adicionarItem} size="sm" variant="outline">
//                     <Plus className="h-4 w-4 mr-1" />
//                     Adicionar Item
//                   </Button>
//                 </div>

//                 <ScrollArea className="h-[300px] border rounded-lg p-4">
//                   <div className="space-y-3">
//                     {itens.map((item, index) => (
//                       <div key={index} className="flex gap-2 items-start p-3 bg-slate-50 rounded-lg">
//                         <div className="flex-1 space-y-2">
//                           <Select
//                             value={item.contaContabilId}
//                             onValueChange={(value) => {
//                               const conta = contas.find((c) => c.id === value);
//                               atualizarItem(index, "contaContabilId", value);
//                               if (conta) {
//                                 atualizarItem(index, "codigoConta", conta.codigo);
//                                 atualizarItem(index, "nomeConta", conta.nome);
//                               }
//                             }}
//                           >
//                             <SelectTrigger>
//                               <SelectValue placeholder="Selecione a conta" />
//                             </SelectTrigger>
//                             <SelectContent>
//                               {contas.map((conta) => (
//                                 <SelectItem key={conta.id} value={conta.id}>
//                                   {conta.codigo} - {conta.nome}
//                                 </SelectItem>
//                               ))}
//                             </SelectContent>
//                           </Select>
//                         </div>

//                         <div className="w-32">
//                           <Label className="text-xs">Débito</Label>
//                           <Input
//                             type="number"
//                             step="0.01"
//                             min="0"
//                             value={item.debito}
//                             onChange={(e) => atualizarItem(index, "debito", e.target.value)}
//                             className="text-right"
//                           />
//                         </div>

//                         <div className="w-32">
//                           <Label className="text-xs">Crédito</Label>
//                           <Input
//                             type="number"
//                             step="0.01"
//                             min="0"
//                             value={item.credito}
//                             onChange={(e) => atualizarItem(index, "credito", e.target.value)}
//                             className="text-right"
//                           />
//                         </div>

//                         {itens.length > 2 && (
//                           <Button
//                             type="button"
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => removerItem(index)}
//                             className="mt-5 text-red-600 hover:text-red-700 hover:bg-red-50"
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </Button>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 </ScrollArea>
//               </div>

//               {/* Totalizadores */}
//               <Card className={partidasValidas ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"}>
//                 <CardContent className="pt-4">
//                   <div className="flex items-center justify-between">
//                     <div className="space-y-1">
//                       <div className="flex items-center space-x-2">
//                         {partidasValidas ? (
//                           <CheckCircle2 className="h-5 w-5 text-green-600" />
//                         ) : (
//                           <AlertCircle className="h-5 w-5 text-red-600" />
//                         )}
//                         <span className="font-semibold">
//                           {partidasValidas ? "Partidas Dobradas Válidas" : "Partidas Dobradas Inválidas"}
//                         </span>
//                       </div>
//                       <p className="text-sm text-muted-foreground">
//                         {partidasValidas
//                           ? "Débito = Crédito (método das partidas dobradas)"
//                           : "Débito deve ser igual ao Crédito"}
//                       </p>
//                     </div>
//                     <div className="text-right space-y-1">
//                       <div className="text-sm">
//                         <span className="text-muted-foreground">Total Débito:</span>{" "}
//                         <span className="font-bold">{totalDebito.toFixed(2)} Kz</span>
//                       </div>
//                       <div className="text-sm">
//                         <span className="text-muted-foreground">Total Crédito:</span>{" "}
//                         <span className="font-bold">{totalCredito.toFixed(2)} Kz</span>
//                       </div>
//                       {!partidasValidas && diferenca !== 0 && (
//                         <div className="text-sm text-red-600 font-semibold">
//                           Diferença: {Math.abs(diferenca).toFixed(2)} Kz
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Observações */}
//               <div className="space-y-2">
//                 <Label htmlFor="observacoes">Observações</Label>
//                 <Textarea
//                   id="observacoes"
//                   value={novoLancamento.observacoes}
//                   onChange={(e) => setNovoLancamento({ ...novoLancamento, observacoes: e.target.value })}
//                   placeholder="Observações adicionais (opcional)"
//                   rows={2}
//                 />
//               </div>

//               <div className="flex justify-end space-x-2 pt-4 border-t">
//                 <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
//                   Cancelar
//                 </Button>
//                 <Button
//                   type="submit"
//                   className="bg-emerald-600 hover:bg-emerald-700"
//                   disabled={!partidasValidas}
//                 >
//                   Criar Lançamento
//                 </Button>
//               </div>
//             </form>
//           </DialogContent>
//         </Dialog>
//       </div>

//       {/* Lista de Lançamentos */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Lançamentos Recentes</CardTitle>
//           <CardDescription>{lancamentos.length} lançamentos encontrados</CardDescription>
//         </CardHeader>
//         <CardContent>
//           {loading ? (
//             <div className="text-center py-8 text-slate-500">Carregando...</div>
//           ) : lancamentos.length === 0 ? (
//             <div className="text-center py-8 text-slate-500">Nenhum lançamento encontrado</div>
//           ) : (
//             <ScrollArea className="h-[600px]">
//               <div className="space-y-4">
//                 {lancamentos.map((lancamento) => (
//                   <Card key={lancamento.id} className="border-l-4 border-l-emerald-500">
//                     <CardHeader className="pb-3">
//                       <div className="flex items-start justify-between">
//                         <div className="space-y-1">
//                           <div className="flex items-center space-x-2">
//                             <Calendar className="h-4 w-4 text-muted-foreground" />
//                             <span className="font-semibold">
//                               {format(new Date(lancamento.data), "dd/MM/yyyy", { locale: ptBR })}
//                             </span>
//                             {lancamento.documento && (
//                               <Badge variant="outline">Doc: {lancamento.documento}</Badge>
//                             )}
//                           </div>
//                           <p className="text-sm text-muted-foreground">{lancamento.descricao}</p>
//                         </div>
//                         <Badge className="bg-emerald-100 text-emerald-800">
//                           {parseFloat(lancamento.totalDebito).toFixed(2)} Kz
//                         </Badge>
//                       </div>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="space-y-2">
//                         {lancamento.itens.map((item, idx) => (
//                           <div
//                             key={item.id || idx}
//                             className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded"
//                           >
//                             <div className="flex items-center space-x-2">
//                               <code className="text-xs font-mono bg-white px-2 py-1 rounded">
//                                 {item.codigoConta}
//                               </code>
//                               <span>{item.nomeConta}</span>
//                             </div>
//                             <div className="flex space-x-4 font-mono text-sm">
//                               <span className="text-blue-600">
//                                 D: {parseFloat(item.debito).toFixed(2)}
//                               </span>
//                               <span className="text-red-600">
//                                 C: {parseFloat(item.credito).toFixed(2)}
//                               </span>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             </ScrollArea>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
  
// }

"use client";

import { useEffect, useState } from "react";
import { FileText, Plus, Calendar, Trash2, AlertCircle, CheckCircle2, Edit, RotateCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type ItemLancamento = {
  id?: string;
  contaContabilId: string;
  codigoConta?: string;
  nomeConta?: string;
  debito: string;
  credito: string;
};

type Lancamento = {
  id: string;
  data: string;
  descricao: string;
  documento?: string | null;
  tipo: string;
  totalDebito: string;
  totalCredito: string;
  status: string;
  observacoes?: string | null;
  itens: ItemLancamento[];
};

type Conta = {
  id: string;
  codigo: string;
  nome: string;
  tipo: string;
  aceitaLancamento: boolean;
};

export default function LancamentosPage() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [contas, setContas] = useState<Conta[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [lancamentoEdit, setLancamentoEdit] = useState<Lancamento | null>(null);
  const [estornoDialogOpen, setEstornoDialogOpen] = useState(false);
  const [lancamentoEstorno, setLancamentoEstorno] = useState<Lancamento | null>(null);

  // Novo lançamento
  const [novoLancamento, setNovoLancamento] = useState({
    data: format(new Date(), "yyyy-MM-dd"),
    descricao: "",
    documento: "",
    tipo: "NORMAL",
    observacoes: "",
  });

  const [itens, setItens] = useState<ItemLancamento[]>([
    { contaContabilId: "", debito: "0", credito: "0" },
    { contaContabilId: "", debito: "0", credito: "0" },
  ]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [lancResponse, contasResponse] = await Promise.all([
        fetch("/api/lancamentos"),
        fetch("/api/contas?ativas=true"),
      ]);

      const [lancData, contasData] = await Promise.all([
        lancResponse.json(),
        contasResponse.json(),
      ]);

      setLancamentos(lancData || []);
      setContas((contasData || []).filter((c: Conta) => c.aceitaLancamento));
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const calcularTotais = () => {
    const totalDebito = itens.reduce((acc, item) => acc + parseFloat(item.debito || "0"), 0);
    const totalCredito = itens.reduce((acc, item) => acc + parseFloat(item.credito || "0"), 0);
    return { totalDebito, totalCredito, diferenca: totalDebito - totalCredito };
  };

  const adicionarItem = () => {
    setItens([...itens, { contaContabilId: "", debito: "0", credito: "0" }]);
  };

  const removerItem = (index: number) => {
    if (itens.length > 2) {
      setItens(itens.filter((_, i) => i !== index));
    }
  };

  // const atualizarItem = (index: number, campo: keyof ItemLancamento, valor: string) => {
  //   const novosItens = [...itens];
  //   novosItens[index] = { ...novosItens[index], [campo]: valor };
  //   setItens(novosItens);
  // };

  const atualizarItem = (index: number, campo: keyof ItemLancamento, valor: string) => {
  setItens((prevItens) => {
    const novosItens = [...prevItens];
    // Criamos uma cópia do objeto específico que está sendo alterado
    novosItens[index] = { 
      ...novosItens[index], 
      [campo]: valor 
    };
    return novosItens;
  });
};

  const handleCriarLancamento = async (e: React.FormEvent) => {
    e.preventDefault();

    const { totalDebito, totalCredito, diferenca } = calcularTotais();

    if (Math.abs(diferenca) > 0.01) {
      alert("Partidas dobradas inválidas! Débito deve ser igual ao Crédito.");
      return;
    }

    if (totalDebito === 0 || totalCredito === 0) {
      alert("O lançamento deve ter valores de débito e crédito.");
      return;
    }

    // Filtrar itens válidos
    const itensValidos = itens.filter(
      (item) => item.contaContabilId && (parseFloat(item.debito) > 0 || parseFloat(item.credito) > 0)
    );

    if (itensValidos.length < 2) {
      alert("O lançamento deve ter pelo menos 2 itens.");
      return;
    }

    try {
      const response = await fetch("/api/lancamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...novoLancamento,
          itens: itensValidos,
        }),
      });

      if (response.ok) {
        await carregarDados();
        setDialogOpen(false);
        // Reset
        setNovoLancamento({
          data: format(new Date(), "yyyy-MM-dd"),
          descricao: "",
          documento: "",
          tipo: "NORMAL",
          observacoes: "",
        });
        setItens([
          { contaContabilId: "", debito: "0", credito: "0" },
          { contaContabilId: "", debito: "0", credito: "0" },
        ]);
        alert("Lançamento criado com sucesso!");
      } else {
        const error = await response.json();
        alert(error.message || "Erro ao criar lançamento");
      }
    } catch (error) {
      console.error("Erro ao criar lançamento:", error);
      alert("Erro ao criar lançamento");
    }
  };

  const abrirEdicao = (lancamento: Lancamento) => {
    setLancamentoEdit(lancamento);
    setNovoLancamento({
      data: format(new Date(lancamento.data), "yyyy-MM-dd"),
      descricao: lancamento.descricao,
      documento: lancamento.documento || "",
      tipo: lancamento.tipo,
      observacoes: lancamento.observacoes || "",
    });
    setItens(lancamento.itens.map(item => ({
      ...item,
      contaContabilId: item.contaContabilId || "",
      debito: item.debito,
      credito: item.credito,
    })));
    setEditDialogOpen(true);
  };

  const handleEditarLancamento = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lancamentoEdit) return;

    const { totalDebito, totalCredito, diferenca } = calcularTotais();

    if (Math.abs(diferenca) > 0.01) {
      alert("Partidas dobradas inválidas! Débito deve ser igual ao Crédito.");
      return;
    }

    const itensValidos = itens.filter(
      (item) => item.contaContabilId && (parseFloat(item.debito) > 0 || parseFloat(item.credito) > 0)
    );

    if (itensValidos.length < 2) {
      alert("O lançamento deve ter pelo menos 2 itens.");
      return;
    }

    try {
      const response = await fetch(`/api/lancamentos/${lancamentoEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...novoLancamento,
          itens: itensValidos,
        }),
      });

      if (response.ok) {
        await carregarDados();
        setEditDialogOpen(false);
        setLancamentoEdit(null);
        // Reset
        setNovoLancamento({
          data: format(new Date(), "yyyy-MM-dd"),
          descricao: "",
          documento: "",
          tipo: "NORMAL",
          observacoes: "",
        });
        setItens([
          { contaContabilId: "", debito: "0", credito: "0" },
          { contaContabilId: "", debito: "0", credito: "0" },
        ]);
        alert("Lançamento editado com sucesso!");
      } else {
        const error = await response.json();
        alert(error.message || "Erro ao editar lançamento");
      }
    } catch (error) {
      console.error("Erro ao editar lançamento:", error);
      alert("Erro ao editar lançamento");
    }
  };

  const confirmarEstorno = (lancamento: Lancamento) => {
    setLancamentoEstorno(lancamento);
    setEstornoDialogOpen(true);
  };

  const handleEstornar = async () => {
    if (!lancamentoEstorno) return;

    try {
      const response = await fetch(`/api/lancamentos/${lancamentoEstorno.id}/estornar`, {
        method: "POST",
      });

      if (response.ok) {
        await carregarDados();
        setEstornoDialogOpen(false);
        setLancamentoEstorno(null);
        alert("Lançamento estornado com sucesso!");
      } else {
        const error = await response.json();
        alert(error.message || "Erro ao estornar lançamento");
      }
    } catch (error) {
      console.error("Erro ao estornar lançamento:", error);
      alert("Erro ao estornar lançamento");
    }
  };

  const { totalDebito, totalCredito, diferenca } = calcularTotais();
  const partidasValidas = Math.abs(diferenca) < 0.01 && totalDebito > 0;
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
            <FileText className="h-8 w-8 text-emerald-600" />
            <span>Lançamentos Contábeis</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Registro de operações contábeis com método das partidas dobradas
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Lançamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Lançamento Contábil</DialogTitle>
              <DialogDescription>
                Preencha os dados do lançamento seguindo o método das partidas dobradas
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCriarLancamento} className="space-y-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Informações Básicas</h3>
                <div className="grid grid-cols-2 gap-4">
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
                  <div className="space-y-3">
                    {itens.map((item, index) => (
                      <div key={index} className="flex gap-2 items-start p-3 bg-slate-50 rounded-lg">
                        <div className="flex-1 space-y-2">
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

                        <div className="w-32">
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

                        <div className="w-32">
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
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={!partidasValidas}
                >
                  Criar Lançamento
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Lançamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Lançamentos Recentes</CardTitle>
          <CardDescription>{lancamentos.length} lançamentos encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Carregando...</div>
          ) : lancamentos.length === 0 ? (
            <div className="text-center py-8 text-slate-500">Nenhum lançamento encontrado</div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {lancamentos.map((lancamento) => (
                  <Card key={lancamento.id} className="border-l-4 border-l-emerald-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">
                              {format(new Date(lancamento.data), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                            {lancamento.documento && (
                              <Badge variant="outline">Doc: {lancamento.documento}</Badge>
                            )}
                            <Badge 
                              variant={
                                lancamento.status === "ATIVO" ? "default" : 
                                lancamento.status === "ESTORNADO" ? "destructive" : 
                                "secondary"
                              }
                            >
                              {lancamento.status}
                            </Badge>
                            {lancamento.tipo === "ESTORNO" && (
                              <Badge variant="outline" className="bg-orange-100 text-orange-800">
                                ESTORNO
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{lancamento.descricao}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-emerald-100 text-emerald-800">
                            {parseFloat(lancamento.totalDebito).toFixed(2)} Kz
                          </Badge>
                          {lancamento.status === "ATIVO" && lancamento.tipo !== "ESTORNO" && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => abrirEdicao(lancamento)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => confirmarEstorno(lancamento)}
                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {lancamento.itens.map((item, idx) => (
                          <div
                            key={item.id || idx}
                            className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded"
                          >
                            <div className="flex items-center space-x-2">
                              <code className="text-xs font-mono bg-white px-2 py-1 rounded">
                                {item.codigoConta}
                              </code>
                              <span>{item.nomeConta}</span>
                            </div>
                            <div className="flex space-x-4 font-mono text-sm">
                              <span className="text-blue-600">
                                D: {parseFloat(item.debito).toFixed(2)}
                              </span>
                              <span className="text-red-600">
                                C: {parseFloat(item.credito).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Lançamento Contábil</DialogTitle>
            <DialogDescription>
              Modifique os dados do lançamento
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditarLancamento} className="space-y-6">
            {/* Mesma estrutura do formulário de criar */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Informações Básicas</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-data">Data *</Label>
                  <Input
                    id="edit-data"
                    type="date"
                    value={novoLancamento.data}
                    onChange={(e) => setNovoLancamento({ ...novoLancamento, data: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-documento">Nº Documento</Label>
                  <Input
                    id="edit-documento"
                    value={novoLancamento.documento}
                    onChange={(e) => setNovoLancamento({ ...novoLancamento, documento: e.target.value })}
                    placeholder="NF, Recibo, etc"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-descricao">Descrição/Histórico *</Label>
                <Textarea
                  id="edit-descricao"
                  value={novoLancamento.descricao}
                  onChange={(e) => setNovoLancamento({ ...novoLancamento, descricao: e.target.value })}
                  placeholder="Histórico do lançamento"
                  rows={2}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Itens do Lançamento</h3>
                <Button type="button" onClick={adicionarItem} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar Item
                </Button>
              </div>

              <ScrollArea className="h-[300px] border rounded-lg p-4">
                <div className="space-y-3">
                  {itens.map((item, index) => (
                    <div key={index} className="flex gap-2 items-start p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1 space-y-2">
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

                      <div className="w-32">
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

                      <div className="w-32">
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
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="edit-observacoes">Observações</Label>
              <Textarea
                id="edit-observacoes"
                value={novoLancamento.observacoes}
                onChange={(e) => setNovoLancamento({ ...novoLancamento, observacoes: e.target.value })}
                placeholder="Observações adicionais (opcional)"
                rows={2}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!partidasValidas}
              >
                Salvar Alterações
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* AlertDialog de Confirmação de Estorno */}
      <AlertDialog open={estornoDialogOpen} onOpenChange={setEstornoDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Estorno</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja estornar este lançamento? Esta ação criará um lançamento de
              estorno com valores invertidos e marcará o lançamento original como estornado.
              {lancamentoEstorno && (
                <div className="mt-4 p-3 bg-slate-100 rounded">
                  <p className="font-semibold">{lancamentoEstorno.descricao}</p>
                  <p className="text-sm">Valor: {parseFloat(lancamentoEstorno.totalDebito).toFixed(2)} Kz</p>
                  <p className="text-sm">
                    Data: {format(new Date(lancamentoEstorno.data), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEstornar}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Confirmar Estorno
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
  
}