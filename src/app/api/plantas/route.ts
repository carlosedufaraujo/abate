// src/app/api/plantas/route.ts
export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const plantas = await prisma.planta.findMany({
      orderBy: {
        nome: 'asc',
      },
    });
    return NextResponse.json(plantas);
  } catch (error) {
    console.error("Erro ao buscar plantas:", error);
    return NextResponse.json({ error: 'Erro interno ao buscar plantas' }, { status: 500 });
  }
}

// Add POST, PUT, DELETE later if needed for planta management

