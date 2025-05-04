// src/app/escalas/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ClipboardList, Loader2, PlusCircle, Pencil, Trash2, Search, X, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EscalaForm } from "@/components/escala/EscalaForm";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion"; // Import motion

// Define the structure for an Escala based on the API response
interface Escala {
  id: number;
  dataAbate: string;
  volume: number;
  status: string;
  produtor: { id: number; nome: string };
  planta: { id: number; nome: string };
  observacoes?: string;
}

// Define the Zod schema for validation (matching EscalaForm)
const formSchema = z.object({
  dataAbate: z.date({ required_error: "A data do abate é obrigatória." }),
  volume: z.coerce.number().int().positive({ message: "O volume deve ser um número positivo." }),
  produtorId: z.string({ required_error: "Selecione um produtor." }),
  plantaId: z.string({ required_error: "Selecione uma planta." }),
  status: z.string().optional(),
  observacoes: z.string().optional(),
});

// Helper function to format date
function formatLocalDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() + userTimezoneOffset);
    return localDate.toLocaleDateString("pt-BR", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch (e) {
    return "Data inválida";
  }
}

const statusOptions = ["Agendado", "Confirmado", "Em Trânsito", "Concluído", "Cancelado"];

type SortColumn = 'dataAbate' | 'produtor' | 'planta' | 'volume' | 'status';
type SortDirection = 'asc' | 'desc';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // Adjust stagger for table rows
    },
  },
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

export default function EscalasPage() {
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEscala, setEditingEscala] = useState<Escala | null>(null);
  const { toast } = useToast();

  // State for filters
  const [filterProdutor, setFilterProdutor] = useState("");
  const [filterPlanta, setFilterPlanta] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // State for sorting
  const [sortColumn, setSortColumn] = useState<SortColumn>('dataAbate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  async function fetchEscalas() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/escalas");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Escala[] = await response.json();
      setEscalas(data);
    } catch (err: any) {
      console.error("Failed to fetch escalas:", err);
      setError(`Falha ao carregar escalas: ${err.message}`);
      toast({ title: "Erro", description: `Falha ao carregar escalas: ${err.message}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEscalas();
  }, []);

  // Memoized filtered and sorted escalas
  const processedEscalas = useMemo(() => {
    let filtered = escalas.filter(escala => {
      const produtorMatch = filterProdutor ? escala.produtor.nome.toLowerCase().includes(filterProdutor.toLowerCase()) : true;
      const plantaMatch = filterPlanta ? escala.planta.nome.toLowerCase().includes(filterPlanta.toLowerCase()) : true;
      const statusMatch = filterStatus ? escala.status === filterStatus : true;
      return produtorMatch && plantaMatch && statusMatch;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let valA: any;
      let valB: any;

      switch (sortColumn) {
        case 'dataAbate':
          valA = new Date(a.dataAbate).getTime();
          valB = new Date(b.dataAbate).getTime();
          break;
        case 'produtor':
          valA = a.produtor.nome.toLowerCase();
          valB = b.produtor.nome.toLowerCase();
          break;
        case 'planta':
          valA = a.planta.nome.toLowerCase();
          valB = b.planta.nome.toLowerCase();
          break;
        case 'volume':
          valA = a.volume;
          valB = b.volume;
          break;
        case 'status':
          valA = a.status.toLowerCase();
          valB = b.status.toLowerCase();
          break;
        default:
          return 0;
      }

      if (valA < valB) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (valA > valB) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [escalas, filterProdutor, filterPlanta, filterStatus, sortColumn, sortDirection]);

  // Handle sort change
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Handle form submission (Create and Update)
  async function handleFormSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const method = editingEscala ? 'PUT' : 'POST';
    const url = editingEscala ? `/api/escalas/${editingEscala.id}` : '/api/escalas';

    const payload = {
        ...values,
        produtorId: parseInt(values.produtorId, 10),
        plantaId: parseInt(values.plantaId, 10),
        dataAbate: values.dataAbate.toISOString(),
    };

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      toast({ title: "Sucesso!", description: `Escala ${editingEscala ? 'atualizada' : 'criada'} com sucesso.`, variant: "default" });
      setIsFormOpen(false);
      setEditingEscala(null);
      await fetchEscalas();
    } catch (err: any) {
      console.error(`Failed to ${editingEscala ? 'update' : 'create'} escala:`, err);
      toast({ title: "Erro", description: `Falha ao ${editingEscala ? 'atualizar' : 'criar'} escala: ${err.message}`, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle escala deletion
  async function handleDeleteEscala(id: number) {
    setIsDeleting(id);
    try {
        const response = await fetch(`/api/escalas/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        toast({ title: "Sucesso!", description: "Escala excluída com sucesso.", variant: "default" });
        await fetchEscalas();
    } catch (err: any) {
        console.error("Failed to delete escala:", err);
        toast({ title: "Erro", description: `Falha ao excluir escala: ${err.message}`, variant: "destructive" });
    } finally {
        setIsDeleting(null);
    }
  }

  const handleOpenEditDialog = (escala: Escala) => {
    setEditingEscala(escala);
    setIsFormOpen(true);
  };

  const handleOpenCreateDialog = () => {
    setEditingEscala(null);
    setIsFormOpen(true);
  };

  const clearFilters = () => {
    setFilterProdutor("");
    setFilterPlanta("");
    setFilterStatus("");
  };

  // Helper to render sort icon
  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-2 h-3 w-3 text-muted-foreground/50" />;
    }
    return sortDirection === 'asc' ?
      <ArrowUpDown className="ml-2 h-3 w-3" /> :
      <ArrowUpDown className="ml-2 h-3 w-3" />;
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold flex items-center gap-2">
        <ClipboardList className="h-6 w-6" />
        Gerenciamento de Escalas
      </h1>
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <CardTitle>Lista de Escalas</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
             {/* Filter Inputs */}
             <div className="relative flex-1 md:flex-initial">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Filtrar por produtor..."
                    value={filterProdutor}
                    onChange={(e) => setFilterProdutor(e.target.value)}
                    className="pl-8 sm:w-[200px] lg:w-[250px]"
                />
             </div>
             <div className="relative flex-1 md:flex-initial">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Filtrar por planta..."
                    value={filterPlanta}
                    onChange={(e) => setFilterPlanta(e.target.value)}
                    className="pl-8 sm:w-[200px] lg:w-[250px]"
                />
             </div>
             <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filtrar por status..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="">Todos Status</SelectItem>
                    {statusOptions.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                </SelectContent>
             </Select>
             {(filterProdutor || filterPlanta || filterStatus) && (
                <Button variant="ghost" onClick={clearFilters} size="icon" title="Limpar filtros">
                    <X className="h-4 w-4" />
                </Button>
             )}
             {/* Add Escala Button */}
             <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
                 setIsFormOpen(isOpen);
                 if (!isOpen) setEditingEscala(null);
             }}>
               <DialogTrigger asChild>
                 <Button size="sm" onClick={handleOpenCreateDialog} className="w-full sm:w-auto">
                   <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
                 </Button>
               </DialogTrigger>
               <DialogContent className="sm:max-w-[425px] md:max-w-lg">
                 <DialogHeader>
                   <DialogTitle>{editingEscala ? "Editar Escala" : "Adicionar Nova Escala"}</DialogTitle>
                   <DialogDescription>
                     {editingEscala ? "Modifique os detalhes da escala abaixo." : "Preencha os detalhes para registrar uma nova escala."}
                   </DialogDescription>
                 </DialogHeader>
                 <EscalaForm
                   key={editingEscala ? editingEscala.id : 'new'}
                   onSubmit={handleFormSubmit}
                   initialData={editingEscala ? { ...editingEscala, produtorId: editingEscala.produtor.id, plantaId: editingEscala.planta.id } : {}}
                   isLoading={isSubmitting}
                 />
               </DialogContent>
             </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          {error && (
            <div className="text-destructive text-center h-64 flex items-center justify-center">
              {error}
            </div>
          )}
          {!loading && !error && (
            <Table>
              <TableCaption>
                {processedEscalas.length > 0
                    ? `Exibindo ${processedEscalas.length} de ${escalas.length} escalas registradas.`
                    : escalas.length === 0
                    ? "Nenhuma escala registrada."
                    : "Nenhuma escala encontrada com os filtros aplicados."
                }
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">
                    <Button variant="ghost" onClick={() => handleSort('dataAbate')} className="px-0 hover:bg-transparent">
                      Data Abate {renderSortIcon('dataAbate')}
                    </Button>
                  </TableHead>
                  <TableHead>
                     <Button variant="ghost" onClick={() => handleSort('produtor')} className="px-0 hover:bg-transparent">
                       Produtor {renderSortIcon('produtor')}
                     </Button>
                  </TableHead>
                  <TableHead>
                     <Button variant="ghost" onClick={() => handleSort('planta')} className="px-0 hover:bg-transparent">
                       Planta {renderSortIcon('planta')}
                     </Button>
                  </TableHead>
                  <TableHead className="text-right w-[100px]">
                     <Button variant="ghost" onClick={() => handleSort('volume')} className="px-0 hover:bg-transparent justify-end w-full">
                       Volume {renderSortIcon('volume')}
                     </Button>
                  </TableHead>
                  <TableHead className="w-[120px]">
                     <Button variant="ghost" onClick={() => handleSort('status')} className="px-0 hover:bg-transparent">
                       Status {renderSortIcon('status')}
                     </Button>
                  </TableHead>
                  <TableHead className="text-right w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              {/* Apply motion variants to TableBody */}
              <motion.tbody
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {processedEscalas.map((escala) => (
                  // Apply motion variants to TableRow
                  <motion.tr key={escala.id} variants={itemVariants} layout>
                    <TableCell>{formatLocalDate(escala.dataAbate)}</TableCell>
                    <TableCell className="font-medium">{escala.produtor.nome}</TableCell>
                    <TableCell>{escala.planta.nome}</TableCell>
                    <TableCell className="text-right">{escala.volume}</TableCell>
                    <TableCell>
                      <Badge variant={escala.status === 'Concluído' ? 'secondary' : 'default'}>
                        {escala.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                       <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(escala)} title="Editar">
                         <Pencil className="h-4 w-4" />
                       </Button>
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={isDeleting === escala.id} title="Excluir">
                                {isDeleting === escala.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir a escala do produtor "{escala.produtor.nome}" agendada para {formatLocalDate(escala.dataAbate)}?
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleDeleteEscala(escala.id)}
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                  </motion.tr>
                ))}
                 {processedEscalas.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                            {escalas.length === 0 ? "Nenhuma escala encontrada." : "Nenhuma escala encontrada com os filtros aplicados."}
                        </TableCell>
                    </TableRow>
                 )}
              </motion.tbody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

