ALTER TABLE "Usuario"
ADD COLUMN "requiereCambioPassword" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Usuario"
SET "requiereCambioPassword" = true
WHERE "rol" = 'SOCIO';
