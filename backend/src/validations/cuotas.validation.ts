import { z } from 'zod';

// SOCIO

export const getCuotasSocioSchema = z.object({
  query: z.object({
    mes: z
      .string()
      .optional()
      .describe('Filtro opcional por mes'),
  }),
});

export const sendComprobanteSchema = z.object({
  params: z.object({
    cuotaId: z.coerce.number()
      .int()
      .positive()
      .describe('El ID de la cuota debe ser un número positivo'),
  }),
  file: z.object({
    mimetype: z.enum(['application/pdf', 'image/jpeg', 'image/png'])
      .describe('Formato no permitido, debe ser PDF, JPG o PNG'),
    size: z.number()
      .max(5 * 1024 * 1024)
      .describe('El archivo no debe superar los 5MB'),
    originalname: z.string(),
    path: z.string().optional(),
  }),
});

// ADMINISTRATIVO / ADMIN

export const updateEstadoCuotaSchema = z.object({
  params: z.object({
    id: z.coerce.number()
      .int()
      .positive()
      .describe('El ID de la cuota debe ser un número positivo'),
  }),
  body: z.object({
    estado: z.enum(['Aprobada', 'Rechazada'])
      .describe('El estado debe ser Aprobada o Rechazada'),
  }),
});

// ADMIN

// Estados válidos del enum Prisma
export const EstadoCuotaSchema = z.enum([
  'PENDIENTE',
  'VENCIDA',
  'PAGADA',
  'EN_REVISION',
]);

// POST /api/cuotas/admin/generar
export const createCuotaSchema = z.object({
  actividadId: z.coerce.number()
    .int()
    .min(0, { message: 'El ID de la actividad no puede ser negativo (usar 0 para todas)' })
    .optional()
    .default(0),

  soloSinActividad: z.boolean().optional().default(false),

  mes: z.enum([
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
  ])
    .describe('Debe ser un mes válido'),

  montoBase: z.coerce.number()
    .min(0, { message: 'El monto base no puede ser negativo' })
    .max(1000000, { message: 'El monto base debe ser menor a 1 millón' }),

  fechaVencimiento: z.string().optional(),

  preview: z.boolean().optional(),
});


// PUT o PATCH /api/cuotas/admin/:id
export const updateCuotaSchema = createCuotaSchema.partial();

