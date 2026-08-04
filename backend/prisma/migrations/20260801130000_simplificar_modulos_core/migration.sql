-- Simplifica el dominio al flujo principal: socios, actividades, cuotas y eventos.

ALTER TABLE "Evento" ADD COLUMN IF NOT EXISTS "ubicacion" TEXT;

ALTER TABLE "Evento" DROP CONSTRAINT IF EXISTS "Evento_canchaId_fkey";
ALTER TABLE "Evento" DROP COLUMN IF EXISTS "canchaId";

ALTER TABLE "Clase" DROP CONSTRAINT IF EXISTS "Clase_actividadId_fkey";
ALTER TABLE "Clase" DROP CONSTRAINT IF EXISTS "Clase_profesorId_fkey";
DROP TABLE IF EXISTS "Clase";

ALTER TABLE "Reserva" DROP CONSTRAINT IF EXISTS "Reserva_socioId_fkey";
DROP TABLE IF EXISTS "Reserva";

DROP TABLE IF EXISTS "Profesor";
DROP TABLE IF EXISTS "Cancha";

DROP TYPE IF EXISTS "DiaSemana";
DROP TYPE IF EXISTS "EstadoReserva";
