import prisma from "../config/prisma";
import { Actividad, CreateActividadRequest, UpdateActividadRequest } from "../types/actividad";

// Mapeo de Prisma a tipo Actividad
function mapActividadPrismaToActividad(actividad: any): Actividad {
  return {
    id: actividad.id,
    nombre: actividad.nombre,
    monto: actividad.monto,
    activo: actividad.activo,
    createdAt: actividad.createdAt,
  };
}

function normalizeNombreActividad(nombre: string) {
  return nombre.trim().replace(/\s+/g, " ");
}

function createDuplicateActividadError(nombre: string) {
  const error = new Error(`Ya existe una actividad con el nombre ${nombre}`) as any;
  error.statusCode = 409;
  error.publicMessage = "Ya existe una actividad con ese nombre.";
  return error;
}

// Obtener todas las actividades
export async function getAllActividades(): Promise<Actividad[]> {
  const actividades = await prisma.actividad.findMany({
    orderBy: { createdAt: "desc" },
  });
  return actividades.map(mapActividadPrismaToActividad);
}

// Obtener actividad por ID
export async function getActividadById(id: number): Promise<Actividad> {
  const actividad = await prisma.actividad.findUnique({
    where: { id },
  });
  if (!actividad) throw new Error("Actividad no encontrada");
  return mapActividadPrismaToActividad(actividad);
}

// Crear actividad
export async function createActividad(data: CreateActividadRequest): Promise<Actividad> {
  const nombre = normalizeNombreActividad(data.nombre);
  const existente = await prisma.actividad.findFirst({
    where: { nombre: { equals: nombre, mode: "insensitive" } },
    select: { id: true },
  });

  if (existente) throw createDuplicateActividadError(nombre);

  const actividad = await prisma.actividad.create({
    data: {
      ...data,
      nombre,
    },
  });
  return mapActividadPrismaToActividad(actividad);
}

// Actualizar actividad
export async function updateActividad(id: number, data: UpdateActividadRequest): Promise<Actividad> {
  const nombre = data.nombre ? normalizeNombreActividad(data.nombre) : undefined;

  if (nombre) {
    const existente = await prisma.actividad.findFirst({
      where: {
        nombre: { equals: nombre, mode: "insensitive" },
        NOT: { id },
      },
      select: { id: true },
    });

    if (existente) throw createDuplicateActividadError(nombre);
  }

  const actividad = await prisma.actividad.update({
    where: { id },
    data: {
      ...data,
      ...(nombre ? { nombre } : {}),
    },
  });
  return mapActividadPrismaToActividad(actividad);
}

// Eliminar actividad
// Elimina una Actividad y todo lo relacionado de forma atómica
export async function deleteActividad(id: number): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // 1) Traer IDs de eventos de esta actividad
    const eventos = await tx.evento.findMany({
      where: { actividadId: id },
      select: { id: true },
    });
    const eventoIds = eventos.map(e => e.id);

    // 2) Borrar entradas de esos eventos
    if (eventoIds.length > 0) {
      await tx.entrada.deleteMany({
        where: { eventoId: { in: eventoIds } },
      });
    }

    // 3) Borrar eventos de la actividad
    await tx.evento.deleteMany({
      where: { actividadId: id },
    });

    // 4) Borrar relaciones many-to-many / auxiliares
    await tx.actividadSocio.deleteMany({
      where: { actividadId: id },
    });

    await tx.cuotaXactividad.deleteMany({
      where: { actividadId: id },
    });

    // 5) Finalmente, borrar la actividad
    await tx.actividad.delete({
      where: { id },
    });
  });
}


