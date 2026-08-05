-- CreateEnum
CREATE TYPE "estado_entrada" AS ENUM ('PENDIENTE', 'PAGADA', 'CANCELADA');

-- AlterEnum
ALTER TYPE "FormaDePago" ADD VALUE 'MERCADOPAGO';

-- AlterTable
ALTER TABLE "Entrada"
ADD COLUMN "estado" "estado_entrada" NOT NULL DEFAULT 'PAGADA',
ADD COLUMN "mercadoPagoPreferenceId" TEXT,
ADD COLUMN "mercadoPagoPaymentId" TEXT,
ADD COLUMN "mercadoPagoStatus" TEXT,
ADD COLUMN "mercadoPagoExternalReference" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Entrada_mercadoPagoPreferenceId_key" ON "Entrada"("mercadoPagoPreferenceId");

-- CreateIndex
CREATE UNIQUE INDEX "Entrada_mercadoPagoExternalReference_key" ON "Entrada"("mercadoPagoExternalReference");
