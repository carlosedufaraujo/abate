-- CreateTable
CREATE TABLE "Produtor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT
);

-- CreateTable
CREATE TABLE "Planta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Escala" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dataAbate" DATETIME NOT NULL,
    "volume" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Agendado',
    "observacoes" TEXT,
    "produtorId" INTEGER NOT NULL,
    "plantaId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Escala_produtorId_fkey" FOREIGN KEY ("produtorId") REFERENCES "Produtor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Escala_plantaId_fkey" FOREIGN KEY ("plantaId") REFERENCES "Planta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Produtor_nome_key" ON "Produtor"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Produtor_email_key" ON "Produtor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Planta_nome_key" ON "Planta"("nome");
