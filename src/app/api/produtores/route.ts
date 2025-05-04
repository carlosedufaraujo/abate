// src/app/api/produtores/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const produtores = await prisma.produtor.findMany({
      orderBy: {
        nome: 'asc',
      },
    });
    return NextResponse.json(produtores);
  } catch (error) {
    console.error("Erro ao buscar produtores:", error);
    return NextResponse.json({ error: 'Erro interno ao buscar produtores' }, { status: 500 });
  }
}

// Add POST, PUT, DELETE later if needed for producer management

