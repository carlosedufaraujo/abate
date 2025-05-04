// src/app/dashboard/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    LayoutDashboard, Loader2, BarChart3, ListChecks,
    ClipboardList, CalendarClock, CheckCircle2, Scale as ScaleIcon
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion"; // Import motion

// Define the structure for an Escala based on the API response
interface Escala {
  id: number;
  dataAbate: string;
  volume: number;
  status: string;
  produtor: { id: number; nome: string };
  planta: { id: number; nome: string };
}

// Define the structure for the KPI data
interface KpiData {
  totalEscalas: number;
  escalasAgendadas: number;
  escalasConcluidas: number;
  volumeTotal: number;
}

// Define structure for chart data
interface ChartData {
  name: string;
  count: number;
}

// Helper function to format date
function formatLocalDateShort(dateString: string): string {
    try {
        const date = new Date(dateString);
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        const localDate = new Date(date.getTime() + userTimezoneOffset);
        return localDate.toLocaleDateString("pt-BR", {
            day: '2-digit',
            month: 'short',
        });
    } catch (e) {
        return "-";
    }
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Stagger children animations
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

export default function DashboardPage() {
  const [kpiData, setKpiData] = useState<KpiData | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [recentEscalas, setRecentEscalas] = useState<Escala[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEscalas() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/escalas');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const escalas: Escala[] = await response.json();

        // Calculate KPIs
        const totalEscalas = escalas.length;
        const escalasAgendadas = escalas.filter(e => e.status === 'Agendado').length;
        const escalasConcluidas = escalas.filter(e => e.status === 'Concluído').length;
        const volumeTotal = escalas.reduce((sum, e) => sum + e.volume, 0);

        setKpiData({
          totalEscalas,
          escalasAgendadas,
          escalasConcluidas,
          volumeTotal,
        });

        // Prepare data for the chart (count by status)
        const statusCounts: { [key: string]: number } = {};
        escalas.forEach(escala => {
          statusCounts[escala.status] = (statusCounts[escala.status] || 0) + 1;
        });
        const formattedChartData = Object.entries(statusCounts).map(([name, count]) => ({
          name,
          count,
        }));
        setChartData(formattedChartData);

        // Get recent escalas
        const sortedEscalas = [...escalas].sort((a, b) => new Date(b.dataAbate).getTime() - new Date(a.dataAbate).getTime());
        setRecentEscalas(sortedEscalas.slice(0, 5));

      } catch (err: any) {
        console.error("Failed to fetch escalas:", err);
        setError(`Falha ao carregar dados: ${err.message}`);
        setKpiData(null);
        setChartData([]);
        setRecentEscalas([]);
      } finally {
        setLoading(false);
      }
    }

    fetchEscalas();
  }, []);

  return (
    <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants} // Apply container variants to the main div
        className="flex flex-col gap-4"
    >
      <motion.h1 variants={itemVariants} className="text-2xl font-semibold flex items-center gap-2">
        <LayoutDashboard className="h-6 w-6" />
        Dashboard
      </motion.h1>

      {error && (
        <motion.div variants={itemVariants}>
            <Card className="bg-destructive/10 border-destructive">
            <CardHeader>
                <CardTitle className="text-destructive">Erro</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{error}</p>
            </CardContent>
            </Card>
        </motion.div>
      )}

      {/* KPI Cards - Apply container variants to the grid */}
      <motion.div
        variants={containerVariants} // Use container variants for stagger effect
        initial="hidden"
        animate="visible"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={itemVariants}> {/* Apply item variants to each card's wrapper */}
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Escalas</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {loading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : <div className="text-2xl font-bold">{kpiData?.totalEscalas ?? 'N/A'}</div>}
            </CardContent>
            </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Escalas Agendadas</CardTitle>
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {loading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : <div className="text-2xl font-bold">{kpiData?.escalasAgendadas ?? 'N/A'}</div>}
            </CardContent>
            </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Escalas Concluídas</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {loading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : <div className="text-2xl font-bold">{kpiData?.escalasConcluidas ?? 'N/A'}</div>}
            </CardContent>
            </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Volume Total (Cabeças)</CardTitle>
                <ScaleIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {loading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : <div className="text-2xl font-bold">{kpiData?.volumeTotal.toLocaleString("pt-BR") ?? 'N/A'}</div>}
            </CardContent>
            </Card>
        </motion.div>
      </motion.div>

      {/* Chart and Recent Activity Section - Apply container variants to the grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-7"
      >
         <motion.div variants={itemVariants} className="col-span-4"> {/* Apply item variants */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Escalas por Status
                    </CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                {loading ? (
                    <div className="h-[350px] w-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : error ? (
                    <div className="h-[350px] w-full flex items-center justify-center text-destructive">
                        Falha ao carregar gráfico.
                    </div>
                ) : chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip
                        cursor={{ fill: 'hsl(var(--muted))' }}
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                        />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Quantidade" />
                    </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-[350px] w-full flex items-center justify-center text-muted-foreground">
                        Nenhuma escala encontrada para exibir no gráfico.
                    </div>
                )}
                </CardContent>
            </Card>
         </motion.div>
         <motion.div variants={itemVariants} className="col-span-3"> {/* Apply item variants */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ListChecks className="h-5 w-5" />
                        Atividade Recente
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="h-[350px] w-full flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : error ? (
                        <div className="h-[350px] w-full flex items-center justify-center text-destructive">
                            Falha ao carregar atividades.
                        </div>
                    ) : recentEscalas.length > 0 ? (
                        <div className="space-y-4 h-[350px] overflow-y-auto pr-2">
                            {recentEscalas.map((escala) => (
                                <div key={escala.id} className="flex items-center gap-4">
                                    <Avatar className="hidden h-9 w-9 sm:flex">
                                        <AvatarFallback>{escala.produtor.nome.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="grid gap-1 flex-1">
                                        <p className="text-sm font-medium leading-none truncate">
                                            {escala.produtor.nome}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {escala.planta.nome} - {escala.volume} cabeças
                                        </p>
                                    </div>
                                    <div className="ml-auto text-right">
                                        <div className="text-xs font-medium">{formatLocalDateShort(escala.dataAbate)}</div>
                                        <Badge variant={escala.status === 'Concluído' ? 'secondary' : 'default'} className="text-[10px] mt-1">
                                            {escala.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-[350px] w-full flex items-center justify-center text-muted-foreground">
                            Nenhuma atividade recente encontrada.
                        </div>
                    )}
                </CardContent>
            </Card>
         </motion.div>
      </motion.div>
    </motion.div>
  );
}

