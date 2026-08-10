import { z } from "zod";

export const ACTIVIDAD_MONTO_MAXIMO = 10000;

export const createActividadSchema = z.object({
  nombre: z.string().trim().min(3, "El nombre debe tener al menos 3 caracteres").max(100, "El nombre no puede superar los 100 caracteres"),
  monto: z.preprocess((val) => Number(val), 
    z.number().positive("El monto debe ser mayor a 0").max(ACTIVIDAD_MONTO_MAXIMO, "El monto no puede superar $10.000")
  ),
  activo: z.boolean().optional(),
});

export const updateActividadSchema = z.object({
  nombre: z.string().trim().min(3, "El nombre debe tener al menos 3 caracteres").max(100, "El nombre no puede superar los 100 caracteres").optional(),
  monto: z.preprocess((val) => val !== undefined ? Number(val) : undefined,
    z.number().positive("El monto debe ser mayor a 0").max(ACTIVIDAD_MONTO_MAXIMO, "El monto no puede superar $10.000").optional()
  ),
  activo: z.boolean().optional(),
});
