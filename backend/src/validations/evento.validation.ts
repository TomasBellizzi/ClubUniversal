import { z } from "zod"; 

export const createEventoSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  fecha: z.string()
    .min(1, "La fecha es obligatoria")
    .refine(val => !isNaN(Date.parse(val)), "Fecha inválida"),
  horaInicio: z.string().min(1, "Hora de inicio requerida"),
  horaFin: z.string().min(1, "Hora de fin requerida"),
  capacidad: z.preprocess((val) => Number(val), z.number().int().positive("Capacidad debe ser positiva")),
  precioEntrada: z.preprocess((val) => Number(val), z.number().positive("Precio debe ser positivo")),
  actividadId: z.preprocess((val) => Number(val), z.number().int().positive("Debe seleccionar una actividad")),
  ubicacion: z.string().optional(),
  descripcion: z.string().optional(),
});

export const updateEventoSchema = z.object({
  nombre: z.string().min(1).optional(),
  fecha: z.string()
    .refine(val => !isNaN(Date.parse(val)), "Fecha inválida")
    .optional(),
  horaInicio: z.string().optional(),
  horaFin: z.string().optional(),
  capacidad: z.preprocess((val) => Number(val), z.number().int().positive("Capacidad debe ser positiva")).optional(),
  precioEntrada: z.preprocess((val) => Number(val), z.number().positive("Precio debe ser positivo")).optional(),
  actividadId: z.preprocess((val) => Number(val), z.number().int().positive("Debe seleccionar una actividad")).optional(),
  ubicacion: z.string().optional(),
  descripcion: z.string().optional(),
});

export const registrarVentaSchema = z.object({
  eventoId: z.preprocess((val) => Number(val), z.number().int().positive()),
  cantidad: z.preprocess((val) => Number(val), z.number().positive("Cantidad debe ser mayor a 0")),
  formaDePago: z.enum(["EFECTIVO", "CBU"]),
  socioId: z.preprocess((val) => val ? Number(val) : undefined, z.number().optional()),
  comprobanteUrl: z.string().url().optional(),
});
