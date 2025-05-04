import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Create Produtores
  const produtor1 = await prisma.produtor.upsert({
    where: { nome: 'Fazenda Boa Esperança' },
    update: {},
    create: {
      nome: 'Fazenda Boa Esperança',
      email: 'contato@boaesperanca.com',
      telefone: '11987654321',
    },
  });

  const produtor2 = await prisma.produtor.upsert({
    where: { nome: 'Agropecuária Santa Fé' },
    update: {},
    create: {
      nome: 'Agropecuária Santa Fé',
      email: 'agro@santafe.com.br',
      telefone: '62912345678',
    },
  });

  console.log(`Created produtores: ${produtor1.nome}, ${produtor2.nome}`);

  // Create Plantas
  const planta1 = await prisma.planta.upsert({
    where: { nome: 'Frigorífico Central' },
    update: {},
    create: {
      nome: 'Frigorífico Central',
      cidade: 'Goiânia',
      estado: 'GO',
    },
  });

  const planta2 = await prisma.planta.upsert({
    where: { nome: 'Abatedouro Regional Sul' },
    update: {},
    create: {
      nome: 'Abatedouro Regional Sul',
      cidade: 'Rio Verde',
      estado: 'GO',
    },
  });

  console.log(`Created plantas: ${planta1.nome}, ${planta2.nome}`);

  // Create Escalas
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  await prisma.escala.create({
    data: {
      dataAbate: yesterday,
      volume: 50,
      status: 'Concluído',
      produtorId: produtor1.id,
      plantaId: planta1.id,
      observacoes: 'Lote A1 concluído.',
    },
  });

  await prisma.escala.create({
    data: {
      dataAbate: today,
      volume: 75,
      status: 'Agendado',
      produtorId: produtor2.id,
      plantaId: planta1.id,
    },
  });

  await prisma.escala.create({
    data: {
      dataAbate: tomorrow,
      volume: 100,
      status: 'Agendado',
      produtorId: produtor1.id,
      plantaId: planta2.id,
      observacoes: 'Confirmar transporte.',
    },
  });

   await prisma.escala.create({
    data: {
      dataAbate: nextWeek,
      volume: 80,
      status: 'Agendado',
      produtorId: produtor2.id,
      plantaId: planta2.id,
    },
  });

  console.log(`Created 4 escalas.`);

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

