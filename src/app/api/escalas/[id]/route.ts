// src/app/api/escalas/[id]/route.ts
export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for validation (similar to POST, but ID comes from URL)
const escalaUpdateSchema = z.object({
  dataAbate: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Data inválida" }).optional(),
  volume: z.number().int().positive().optional(),
  status: z.string().optional(),
  observacoes: z.string().optional().nullable(), // Allow null to clear observations
  produtorId: z.number().int().positive().optional(),
  plantaId: z.number().int().positive().optional(),
});

// GET specific escala (optional, might be useful)
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const escala = await prisma.escala.findUnique({
      where: { id },
      include: {
        produtor: true,
        planta: true,
      },
    });

    if (!escala) {
      return NextResponse.json({ error: 'Escala não encontrada' }, { status: 404 });
    }

    return NextResponse.json(escala);
  } catch (error) {
    console.error("Erro ao buscar escala:", error);
    return NextResponse.json({ error: 'Erro interno ao buscar escala' }, { status: 500 });
  }
}

// PUT update escala
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await request.json();
    const validation = escalaUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Dados inválidos', details: validation.error.errors }, { status: 400 });
    }

    const dataToUpdate: any = { ...validation.data };

    // Convert dataAbate to Date object if present
    if (dataToUpdate.dataAbate) {
        dataToUpdate.dataAbate = new Date(dataToUpdate.dataAbate);
    }

    // Check if related entities exist if they are being updated
    if (dataToUpdate.produtorId) {
        const produtorExists = await prisma.produtor.findUnique({ where: { id: dataToUpdate.produtorId } });
        if (!produtorExists) {
            return NextResponse.json({ error: 'Produtor não encontrado' }, { status: 404 });
        }
    }
    if (dataToUpdate.plantaId) {
        const plantaExists = await prisma.planta.findUnique({ where: { id: dataToUpdate.plantaId } });
        if (!plantaExists) {
            return NextResponse.json({ error: 'Planta não encontrada' }, { status: 404 });
        }
    }

    const updatedEscala = await prisma.escala.update({
      where: { id },
      data: dataToUpdate,
      include: {
        produtor: true,
        planta: true,
      },
    });

    return NextResponse.json(updatedEscala);
  } catch (error: any) {
    console.error("Erro ao atualizar escala:", error);
    // Check for specific Prisma errors (e.g., P2025 Record to update not found)
    if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Escala não encontrada para atualização' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Erro interno ao atualizar escala' }, { status: 500 });
  }
}

// DELETE escala (implement later if needed)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = parseInt(params.id, 10);
        if (isNaN(id)) {
            return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
        }

        await prisma.escala.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Escala deletada com sucesso' }, { status: 200 }); // Or 204 No Content

    } catch (error: any) {
        console.error("Erro ao deletar escala:", error);
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Escala não encontrada para deleção' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Erro interno ao deletar escala' }, { status: 500 });
    }
}

