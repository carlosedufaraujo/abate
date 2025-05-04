// src/app/calendario/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarDays, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { addMonths, subMonths, startOfMonth, isSameDay, isToday, format } from 'date-fns'; // Added format
import { ptBR } from 'date-fns/locale'; // Added locale
import { motion, AnimatePresence } from "framer-motion"; // Import motion and AnimatePresence

// Define the structure for an Escala based on the API response
interface Escala {
  id: number;
  dataAbate: string;
  volume: number;
  status: string;
  produtor: { nome: string };
  planta: { nome: string };
  observacoes?: string;
}

// Helper function to get days in a month
function getDaysInMonth(year: number, month: number): Date[] {
  const date = new Date(year, month, 1);
  const days: Date[] = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

// Helper function to format date as YYYY-MM-DD
function formatDateISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Animation variants
const calendarVariants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 50 : -50 // Slide in from right if next month, left if previous
  }),
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: "easeInOut" }
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -50 : 50, // Slide out to left if next month, right if previous
    transition: { duration: 0.3, ease: "easeInOut" }
  })
};

const popoverVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.1 } },
};

export default function CalendarioPage() {
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [direction, setDirection] = useState(0); // 0: initial, 1: next, -1: prev

  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    }
    fetchEscalas();
  }, []);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Group scales by date
  const scalesByDate: { [key: string]: Escala[] } = {};
  escalas.forEach(escala => {
    try {
        const escalaDate = new Date(escala.dataAbate);
        const userTimezoneOffset = escalaDate.getTimezoneOffset() * 60000;
        const localDate = new Date(escalaDate.getTime() + userTimezoneOffset);
        const dateStr = formatDateISO(localDate);
        if (!scalesByDate[dateStr]) {
            scalesByDate[dateStr] = [];
        }
        scalesByDate[dateStr].push(escala);
    } catch (e) {
        console.warn(`Invalid date format for escala ID ${escala.id}: ${escala.dataAbate}`);
    }
  });

  const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const goToPreviousMonth = () => {
    setDirection(-1);
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setDirection(1);
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const goToCurrentMonth = () => {
    const todayMonth = startOfMonth(new Date());
    if (currentMonth.getTime() !== todayMonth.getTime()) {
        setDirection(todayMonth > currentMonth ? 1 : -1);
        setCurrentMonth(todayMonth);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold flex items-center gap-2">
        <CalendarDays className="h-6 w-6" />
        Calendário de Escalas
      </h1>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <Button variant="outline" size="icon" onClick={goToPreviousMonth} aria-label="Mês anterior">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex flex-col items-center">
            <CardTitle className="text-lg capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </CardTitle>
            {!isSameDay(currentMonth, startOfMonth(new Date())) && (
                <Button variant="link" size="sm" onClick={goToCurrentMonth} className="p-0 h-auto text-xs text-muted-foreground">
                    Voltar para hoje
                </Button>
            )}
          </div>
          <Button variant="outline" size="icon" onClick={goToNextMonth} aria-label="Próximo mês">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="pt-4 overflow-hidden"> {/* Added overflow-hidden */}
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
            <AnimatePresence initial={false} custom={direction} mode="wait"> {/* Use AnimatePresence */}
              <motion.div
                key={currentMonth.toISOString()} // Key changes when month changes
                custom={direction}
                variants={calendarVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="grid grid-cols-7 gap-px border-t border-l bg-border"
              >
                {/* Weekday Headers */}
                {weekdays.map(day => (
                  <div key={day} className="text-center font-medium p-2 bg-muted/50 text-sm">
                    {day}
                  </div>
                ))}
                {/* Empty cells before the first day */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="bg-muted/20 min-h-[100px]"></div>
                ))}
                {/* Days of the month */}
                {daysInMonth.map(day => {
                  const dateStr = formatDateISO(day);
                  const dayScales = scalesByDate[dateStr] || [];
                  const isCurrentDay = isToday(day);
                  return (
                    <div
                      key={dateStr}
                      className={cn(
                          "p-1 min-h-[100px] flex flex-col gap-1 bg-background",
                          isCurrentDay && "bg-blue-50 dark:bg-blue-900/20"
                      )}
                    >
                      <span className={cn(
                          "font-semibold text-xs text-right pr-1",
                          isCurrentDay && "text-blue-600 dark:text-blue-400 font-bold"
                      )}>
                          {day.getDate()}
                      </span>
                      <div className="flex flex-col gap-1 overflow-y-auto flex-1" style={{ maxHeight: "80px" }}>
                        {dayScales.map(escala => (
                          <Popover key={escala.id}>
                            <PopoverTrigger asChild>
                               <Badge
                                  variant={escala.status === "Concluído" ? "secondary" : "default"}
                                  className="text-[10px] cursor-pointer truncate block w-full text-left leading-tight py-0.5 px-1"
                               >
                                  {escala.produtor.nome} ({escala.volume})
                               </Badge>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-60 text-sm p-3 shadow-lg rounded-md border bg-popover text-popover-foreground"
                                sideOffset={5}
                                asChild // Use asChild to allow motion.div
                            >
                                <motion.div initial="hidden" animate="visible" variants={popoverVariants}>
                                    <p><strong>Produtor:</strong> {escala.produtor.nome}</p>
                                    <p><strong>Planta:</strong> {escala.planta.nome}</p>
                                    <p><strong>Volume:</strong> {escala.volume}</p>
                                    <p><strong>Status:</strong> {escala.status}</p>
                                    {escala.observacoes && <p><strong>Obs:</strong> {escala.observacoes}</p>}
                                </motion.div>
                            </PopoverContent>
                          </Popover>
                        ))}
                      </div>
                    </div>
                  );
                })}
                 {/* Empty cells after the last day to fill the grid */}
                 {Array.from({ length: (7 - (firstDayOfMonth + daysInMonth.length) % 7) % 7 }).map((_, i) => (
                  <div key={`empty-end-${i}`} className="bg-muted/20 min-h-[100px]"></div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

