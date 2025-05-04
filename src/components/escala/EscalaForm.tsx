// src/components/escala/EscalaForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';

// Define interfaces for related data
interface Produtor {
  id: number;
  nome: string;
}

interface Planta {
  id: number;
  nome: string;
}

// Define the Zod schema for validation
const formSchema = z.object({
  dataAbate: z.date({ required_error: "A data do abate é obrigatória." }),
  volume: z.coerce.number().int().positive({ message: "O volume deve ser um número positivo." }),
  produtorId: z.string({ required_error: "Selecione um produtor." }), // Use string initially for Select
  plantaId: z.string({ required_error: "Selecione uma planta." }), // Use string initially for Select
  status: z.string().optional(),
  observacoes: z.string().optional(),
});

interface EscalaFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>;
  initialData?: Partial<z.infer<typeof formSchema> & { id?: number, produtorId?: number, plantaId?: number }>; // For editing
  isLoading?: boolean;
}

export function EscalaForm({ onSubmit, initialData, isLoading = false }: EscalaFormProps) {
  const [produtores, setProdutores] = useState<Produtor[]>([]);
  const [plantas, setPlantas] = useState<Planta[]>([]);
  const [loadingRelatedData, setLoadingRelatedData] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dataAbate: initialData?.dataAbate ? new Date(initialData.dataAbate) : undefined,
      volume: initialData?.volume || undefined,
      produtorId: initialData?.produtorId?.toString() || undefined,
      plantaId: initialData?.plantaId?.toString() || undefined,
      status: initialData?.status || "Agendado",
      observacoes: initialData?.observacoes || "",
    },
  });

  // Reset form when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      form.reset({
        dataAbate: initialData.dataAbate ? new Date(initialData.dataAbate) : undefined,
        volume: initialData.volume || undefined,
        produtorId: initialData.produtorId?.toString() || undefined,
        plantaId: initialData.plantaId?.toString() || undefined,
        status: initialData.status || "Agendado",
        observacoes: initialData.observacoes || "",
      });
    }
  }, [initialData, form]);

  useEffect(() => {
    async function loadRelatedData() {
      setLoadingRelatedData(true);
      try {
        const [produtoresRes, plantasRes] = await Promise.all([
          fetch("/api/produtores"),
          fetch("/api/plantas"),
        ]);
        if (!produtoresRes.ok || !plantasRes.ok) {
          throw new Error("Falha ao carregar dados relacionados");
        }
        const produtoresData = await produtoresRes.json();
        const plantasData = await plantasRes.json();
        setProdutores(produtoresData);
        setPlantas(plantasData);
      } catch (error) {
        console.error("Erro ao buscar produtores/plantas:", error);
        // Handle error display if needed
      } finally {
        setLoadingRelatedData(false);
      }
    }
    loadRelatedData();
  }, []);

  const statusOptions = ["Agendado", "Confirmado", "Em Trânsito", "Concluído", "Cancelado"];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Data Abate */}
        <FormField
          control={form.control}
          name="dataAbate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data do Abate</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: ptBR })
                      ) : (
                        <span>Escolha uma data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} // Disable past dates
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Volume */}
        <FormField
          control={form.control}
          name="volume"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Volume (Cabeças)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Ex: 50" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Produtor */}
        <FormField
          control={form.control}
          name="produtorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Produtor</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={loadingRelatedData}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingRelatedData ? "Carregando..." : "Selecione um produtor"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {produtores.map((produtor) => (
                    <SelectItem key={produtor.id} value={produtor.id.toString()}>
                      {produtor.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Planta */}
        <FormField
          control={form.control}
          name="plantaId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Planta Frigorífica</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={loadingRelatedData}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingRelatedData ? "Carregando..." : "Selecione uma planta"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {plantas.map((planta) => (
                    <SelectItem key={planta.id} value={planta.id.toString()}>
                      {planta.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status */}
        {initialData?.id && ( // Only show status for editing
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Observacoes */}
        <FormField
          control={form.control}
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Alguma observação adicional?"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading || loadingRelatedData} className="w-full">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData?.id ? "Salvar Alterações" : "Criar Escala"}
        </Button>
      </form>
    </Form>
  );
}

