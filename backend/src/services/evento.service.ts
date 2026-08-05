import { Evento, CreateEventoRequest, UpdateEventoRequest, EventoResponse } from "../types/evento";
import prisma from "../config/prisma";
import { Entrada } from "../types/entradas";
import { FormaDePago } from "@prisma/client";

function mapEventoConVentas(evento: any): Evento {
  const entradas = evento.entradas ?? [];

  const entradasVendidas = entradas.reduce(
    (sum: number, e: any) => e.estado === "PAGADA" ? sum + e.cantidad : sum,
    0
  );

  const montoTotal = entradas.reduce(
    (sum: number, e: any) => e.estado === "PAGADA" ? sum + e.total : sum,
    0
  );

  const entradasConEstado = entradas.map((e: any) => ({
    ...e,
    socio: e.socio
      ? { ...e.socio, estado: e.socio.estado as "ACTIVO" | "INACTIVO" }
      : null,
  }));

  return {
    ...evento,
    entradas: entradasConEstado,
    entradasVendidas,
    montoTotal,
  };
}

// Obtener todos los eventos
export async function getAllEventos(): Promise<Evento[]> {
  const eventos = await prisma.evento.findMany({
    include: {
      actividad: true,
      entradas: {
        include: {
          socio: true,
          evento: true,
        },
      },
    },
    orderBy: { fecha: "asc" },
  });

  return eventos.map(mapEventoConVentas);
}

// Obtener evento por ID
export async function getEventoById(id: number): Promise<EventoResponse> {
  const eventoRaw = await prisma.evento.findUnique({
    where: { id },
    include: {
      actividad: true,
      entradas: { include: { socio: true, evento: true } },
    },
  });

  if (!eventoRaw) throw new Error("Evento no encontrado");

  const evento = mapEventoConVentas(eventoRaw);

  return {
    evento,
    message: "Evento encontrado",
  };
}

// Crear un nuevo evento
export async function createEvento(eventoData: CreateEventoRequest): Promise<EventoResponse> {
  const created = await prisma.evento.create({
    data: {
      nombre: eventoData.nombre,
      fecha: new Date(eventoData.fecha),
      horaInicio: eventoData.horaInicio,
      horaFin: eventoData.horaFin,
      capacidad: eventoData.capacidad,
      precioEntrada: eventoData.precioEntrada,
      actividadId: eventoData.actividadId,
      ubicacion: eventoData.ubicacion,
      descripcion: eventoData.descripcion,
    },
    include: {
      actividad: true,
      entradas: { include: { socio: true, evento: true } },
    },
  });

  const evento = mapEventoConVentas(created);

  return {
    evento,
    message: "Evento creado correctamente",
  };
}

// Actualizar un evento
export async function updateEvento(
  id: number,
  updateData: UpdateEventoRequest
): Promise<EventoResponse> {
  try {
    const updated = await prisma.evento.update({
      where: { id },
      data: {
        nombre: updateData.nombre,
        fecha: updateData.fecha ? new Date(updateData.fecha) : undefined,
        horaInicio: updateData.horaInicio,
        horaFin: updateData.horaFin,
        capacidad: updateData.capacidad,
        precioEntrada: updateData.precioEntrada,
        actividadId: updateData.actividadId,
        ubicacion: updateData.ubicacion,
        descripcion: updateData.descripcion,
      },
      include: {
        actividad: true,
        entradas: { include: { socio: true, evento: true } },
      },
    });

    const evento = mapEventoConVentas(updated);

    return {
      evento,
      message: "Evento actualizado correctamente",
    };
  } catch (e: any) {
    if (e.code === "P2025") {
      throw Object.assign(new Error("Evento no encontrado"), {
        statusCode: 404,
      });
    }
    throw e;
  }
}

// Registrar venta de entradas
export async function registrarVenta(
  eventoId: number,
  cantidad: number,
  formaDePago: FormaDePago,
  socioId?: number,
  comprobanteUrl?: string | null
): Promise<Entrada> {
  const eventoResp = await getEventoById(eventoId);
  const evento = eventoResp.evento;

  if (socioId) {
    const socioExiste = await prisma.socio.findUnique({ where: { id: socioId } });
    if (!socioExiste) throw new Error("El socioId proporcionado no existe");
  }

  const totalVendidas = await prisma.entrada.aggregate({
    _sum: { cantidad: true },
    where: {
      eventoId,
      estado: "PAGADA",
    },
  });
  const entradasVendidas = totalVendidas._sum.cantidad || 0;

  if (entradasVendidas + cantidad > evento.capacidad) {
    throw new Error("No hay suficientes entradas disponibles");
  }

  if (formaDePago === "CBU" && !comprobanteUrl) {
    throw new Error("Debe adjuntar comprobante para pagos por transferencia");
  }

  const nuevaEntrada = await prisma.entrada.create({
    data: {
      eventoId,
      cantidad,
      precioUnitario: evento.precioEntrada,
      total: evento.precioEntrada * cantidad,
      fechaCompra: new Date(),
      formaDePago,
      comprobanteUrl: comprobanteUrl || null,
      ...(socioId && { socioId }),
    },
    include: { socio: true, evento: true },
  });

  return {
    ...nuevaEntrada,
    socio: nuevaEntrada.socio
      ? { ...nuevaEntrada.socio, estado: nuevaEntrada.socio.estado as "ACTIVO" | "INACTIVO" }
      : null,
  };
}

// Eliminar evento junto con sus entradas relacionadas
export async function deleteEvento(id: number): Promise<void> {
  try {
    // Eliminar todas las entradas asociadas al evento
    await prisma.entrada.deleteMany({
      where: { eventoId: id },
    });

    // Ahora eliminar el evento
    await prisma.evento.delete({
      where: { id },
    });
  } catch (error: any) {
    console.error("❌ Error al eliminar evento:", error);
    throw new Error("No se pudo eliminar el evento. Verificá dependencias.");
  }
}

