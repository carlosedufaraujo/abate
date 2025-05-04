// src/app/api/escalas/route.ts
export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for validation
const escalaSchema = z.object({
  dataAbate: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Data inválida" }),
  volume: z.number().int().positive(),
  status: z.string().optional(),
  observacoes: z.string().optional(),
  produtorId: z.number().int().positive(),
  plantaId: z.number().int().positive(),
});

export async function GET(request: Request) {
  try {
    const escalas = await prisma.escala.findMany({
      include: {
        produtor: true,
        planta: true,
      },
      orderBy: {
        dataAbate: 'asc',
      },
    });
    return NextResponse.json(escalas);
  } catch (error) {
    console.error("Erro ao buscar escalas:", error);
    return NextResponse.json({ error: 'Erro interno ao buscar escalas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = escalaSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Dados inválidos', details: validation.error.errors }, { status: 400 });
    }

    const { dataAbate, volume, status, observacoes, produtorId, plantaId } = validation.data;

    // Ensure related entities exist
    const produtorExists = await prisma.produtor.findUnique({ where: { id: produtorId } });
    const plantaExists = await prisma.planta.findUnique({ where: { id: plantaId } });

    if (!produtorExists || !plantaExists) {
        return NextResponse.json({ error: 'Produtor ou Planta não encontrado' }, { status: 404 });
    }

    const novaEscala = await prisma.escala.create({
      data: {
        dataAbate: new Date(dataAbate),
        volume,
        status: status || 'Agendado', // Default status
        observacoes,
        produtorId,
        plantaId,
      },
      include: {
        produtor: true,
        planta: true,
      }
    });

    return NextResponse.json(novaEscala, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar escala:", error);
    // Check for specific Prisma errors if needed
    return NextResponse.json({ error: 'Erro interno ao criar escala' }, { status: 500 });
  }
}

