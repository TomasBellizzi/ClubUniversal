import { PrismaClient, estado_cuota, $Enums } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { supabase } from '../utils/supabaseClient';
import {
  CuotaSocioDTO,
  CuotaAdministrativoDTO,
  ActividadCuotasResumenDTO,
  CuotaAdminDTO,
  GetCuotasAdministrativoQuery,
  EnviarComprobanteResponse,
  GenerarCuotasRequest,
  GenerarCuotasResponse,
  UpdateEstadoCuotaRequest,
  UpdateEstadoCuotaResponse,
  PreviewItem,
  DetalleCuota
} from '../types/cuota';

import prisma from '../config/prisma';

const ACTIVIDADES_PRINCIPALES = ['Basquet', 'Voley', 'Taekwondo', 'Pelota-Paleta'];

export const toDDMMYYYY = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}

function saveComprobanteLocal(fileName: string, buffer: Buffer): string {
  const uploadDir = path.resolve(process.cwd(), 'uploads', 'comprobantes-cuotas');
  fs.mkdirSync(uploadDir, { recursive: true });
  fs.writeFileSync(path.join(uploadDir, fileName), buffer);
  return `/uploads/comprobantes-cuotas/${fileName}`;
}

// ------------------------------------------------------------------
// 🧮 Función auxiliar: determinar estado según vencimiento
// ------------------------------------------------------------------
function determinarEstadoCuota(vencimiento: Date): $Enums.estado_cuota {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return vencimiento >= hoy ? estado_cuota.PENDIENTE : estado_cuota.VENCIDA;
}

// SOCIO
export async function getCuotasSocio(socioId: number): Promise<CuotaSocioDTO[]> {
  const cuotas = await prisma.cuota.findMany({
    where: { socio_id: socioId },
    include: {
      // Traigo todos los comprobantes y filtro en memoria para evitar problemas de compatibilidad
      comprobantes: { select: { url: true, subido_en: true, activo: true } },
    },
    orderBy: { created_at: 'desc' },
  });

  return cuotas.map((c) => {
    const compAct = (c as any).comprobantes?.find((x: any) => x.activo);
    return {
      id: c.id,
      mes: c.mes!,
      monto: Number(c.monto),
      estado: c.estado,
      comprobanteUrl: compAct?.url,
      fechaCarga: compAct?.subido_en ? toDDMMYYYY(compAct.subido_en) : undefined,
      fechaVencimiento: c.fecha_vencimiento ? c.fecha_vencimiento.toISOString() : undefined,
      message: compAct ? undefined : 'Comprobante no cargado',
    };
  });
}

// Subida de comprobante (SOCIO)
export async function enviarComprobante(
  cuotaId: number,
  socioId: number,
  file: Express.Multer.File
): Promise<EnviarComprobanteResponse> {
  const cuota = await prisma.cuota.findFirst({ where: { id: cuotaId, socio_id: socioId } });
  if (!cuota) throw new Error('Cuota no encontrada');

  // Validar formato y tamaño
  if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/i))
    throw new Error('Formato inválido (solo JPG, PNG o PDF)');
  if (file.size > 5 * 1024 * 1024)
    throw new Error('Archivo demasiado grande (máx 5MB)');

  // Subir al bucket de Supabase (soporta multer disk o memory)
  const bucket ='comprobante-cuota';
  const ext = file.originalname.split('.').pop();
  const fileName = `comprobante-cuota-${cuotaId}-${Date.now()}.${ext}`;

  const buffer = (file as any).buffer
    ? (file as any).buffer
    : fs.readFileSync((file as any).path);

  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, buffer, {
      contentType: file.mimetype || 'application/octet-stream',
      upsert: true,
    });

  let publicUrl: string;
  if (error) {
    console.warn(`[Cuotas] No se pudo subir comprobante a Supabase (${bucket}): ${error.message}. Se guarda localmente.`);
    publicUrl = saveComprobanteLocal(fileName, buffer);
  } else {
    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    publicUrl = publicData.publicUrl;
  }


  await prisma.comprobante.upsert({
    where: { cuotaId_activo: { cuotaId, activo: true } },
    update: { url: publicUrl, activo: true },
    create: { cuotaId, url: publicUrl, activo: true },
  });

  await prisma.cuota.update({
    where: { id: cuotaId },
    data: { estado: estado_cuota.EN_REVISION },
  });

  return { success: true, message: 'Comprobante enviado correctamente', url: publicUrl };
}

//  ADMINISTRATIVO
export async function getCuotasAdministrativo(
  filtros: GetCuotasAdministrativoQuery
): Promise<CuotaAdministrativoDTO[]> {
  const where: any = {};
  if (filtros.estado && filtros.estado !== 'Todas') where.estado = filtros.estado;
  const actividadId = Number(filtros.actividadId || 0);
  if (actividadId > 0) {
    where.cuotaXactividad = {
      some: { actividadId },
    };
  }
  if (filtros.nombre) {
    where.Socio = {
      OR: [
        { nombre: { contains: filtros.nombre, mode: 'insensitive' } },
        { apellido: { contains: filtros.nombre, mode: 'insensitive' } },
      ],
    };
  }

  const cuotas = await prisma.cuota.findMany({
    where,
    include: {
      Socio: { select: { id: true, nombre: true, apellido: true, dni: true , fotoCarnet: true} },
      comprobantes: { where: { activo: true }, select: { url: true, subido_en: true } },
      cuotaXactividad: {
        select: {
          actividadId: true,
          monto: true,
          Actividad: {
            select: { id: true, nombre: true },
          },
        },
      },
    },
    orderBy: { created_at: 'desc' },
  });

  return cuotas.map((c) => ({
    id: c.id,
    socioId: c.Socio.id,
    socioNombre: `${c.Socio.nombre} ${c.Socio.apellido}`,
    dni: c.Socio.dni,
    mes: c.mes!,
    monto: Number(c.monto),
    estado: c.estado,
    comprobanteUrl: c.comprobantes?.[0]?.url,
    fechaCarga: c.comprobantes?.[0]?.subido_en
      ? toDDMMYYYY(c.comprobantes[0].subido_en)
      : undefined,
    fotoCarnet: c.Socio.fotoCarnet ?? null,
    actividadIds: c.cuotaXactividad.map((x) => x.actividadId),
    actividades: c.cuotaXactividad.map((x) => ({
      id: x.Actividad.id,
      nombre: x.Actividad.nombre,
      monto: Number(x.monto),
    })),
  }));
}

export async function getCuotasActividadesResumen(): Promise<ActividadCuotasResumenDTO[]> {
  const actividades = await prisma.actividad.findMany({
    where: { activo: true },
    select: {
      id: true,
      nombre: true,
      monto: true,
      activo: true,
      _count: { select: { socios: true } },
    },
  });

  const actividadIds = actividades.map((a) => a.id);
  const cuotasPorActividad = actividadIds.length
    ? await prisma.cuotaXactividad.findMany({
        where: { actividadId: { in: actividadIds } },
        select: {
          actividadId: true,
          Cuota: { select: { estado: true } },
        },
      })
    : [];

  const resumen = new Map<number, {
    total: number;
    pendientes: number;
    enRevision: number;
    pagadas: number;
    vencidas: number;
  }>();

  for (const item of cuotasPorActividad) {
    const actual = resumen.get(item.actividadId) || {
      total: 0,
      pendientes: 0,
      enRevision: 0,
      pagadas: 0,
      vencidas: 0,
    };

    actual.total++;
    if (item.Cuota.estado === estado_cuota.PENDIENTE) actual.pendientes++;
    if (item.Cuota.estado === estado_cuota.EN_REVISION) actual.enRevision++;
    if (item.Cuota.estado === estado_cuota.PAGADA) actual.pagadas++;
    if (item.Cuota.estado === estado_cuota.VENCIDA) actual.vencidas++;
    resumen.set(item.actividadId, actual);
  }

  return actividades
    .map((a) => {
      const data = resumen.get(a.id) || {
        total: 0,
        pendientes: 0,
        enRevision: 0,
        pagadas: 0,
        vencidas: 0,
      };

      return {
        id: a.id,
        nombre: a.nombre,
        monto: Number(a.monto),
        activo: a.activo,
        sociosInscriptos: a._count.socios,
        cuotasTotales: data.total,
        cuotasPendientes: data.pendientes,
        cuotasEnRevision: data.enRevision,
        cuotasPagadas: data.pagadas,
        cuotasVencidas: data.vencidas,
      };
    })
    .sort((a, b) => {
      const aIdx = ACTIVIDADES_PRINCIPALES.findIndex((x) => x.toLowerCase() === a.nombre.toLowerCase());
      const bIdx = ACTIVIDADES_PRINCIPALES.findIndex((x) => x.toLowerCase() === b.nombre.toLowerCase());
      if (aIdx !== -1 || bIdx !== -1) {
        return (aIdx === -1 ? Number.MAX_SAFE_INTEGER : aIdx) - (bIdx === -1 ? Number.MAX_SAFE_INTEGER : bIdx);
      }
      return a.nombre.localeCompare(b.nombre, 'es');
    });
}

// Cambiar estado de cuota (ADMINISTRATIVO)
export async function updateEstadoCuota(
  id: number,
  body: UpdateEstadoCuotaRequest,
  adminName: string
): Promise<UpdateEstadoCuotaResponse> {
  const cuota = await prisma.cuota.findUnique({ where: { id } });
  if (!cuota) throw new Error('Cuota no encontrada');

  const esAprobada = body.estado === 'Aprobada';
  const nuevoEstado = esAprobada ? estado_cuota.PAGADA : estado_cuota.PENDIENTE;

  if (!esAprobada) {
    await prisma.comprobante.updateMany({
      where: { cuotaId: id, activo: true },
      data: { activo: false },
    });
  }

  const yaEstaba = cuota.estado === nuevoEstado;

  await prisma.cuota.update({
    where: { id },
    data: { estado: nuevoEstado },
  });

  return {
    id: cuota.id,
    estado: body.estado,
    fechaCambio: toDDMMYYYY(new Date()),
    cambiadoPor: adminName,
    ...(yaEstaba ? { message: 'El estado ya estaba asignado' } : {}),
  };
}


// ADMIN
export async function getCuotasAdmin(
  filtros?: { estado?: string; nombre?: string }
): Promise<CuotaAdminDTO[]> {
  const where: any = {};

  if (filtros?.estado && filtros.estado !== 'Todas')
    where.estado = filtros.estado;
  if (filtros?.nombre) {
    where.Socio = {
      OR: [
        { nombre: { contains: filtros.nombre, mode: 'insensitive' } },
        { apellido: { contains: filtros.nombre, mode: 'insensitive' } },
      ],
    };
  }

  const cuotas = await prisma.cuota.findMany({
    where,
    include: {
      Socio: { select: { id: true, nombre: true, apellido: true, dni: true } },
      comprobantes: { where: { activo: true }, select: { url: true, subido_en: true } },
    },
    orderBy: { created_at: 'desc' },
  });

  return cuotas.map((c) => ({
    id: c.id,
    socioId: c.Socio.id,
    socioNombre: `${c.Socio.nombre} ${c.Socio.apellido}`,
    dni: c.Socio.dni,
    mes: c.mes!,
    monto: Number(c.monto),
    estado: c.estado,
    comprobanteUrl: c.comprobantes?.[0]?.url,
    fechaCarga: c.comprobantes?.[0]?.subido_en
      ? `${c.comprobantes[0].subido_en.getDate().toString().padStart(2, '0')}/${
          (c.comprobantes[0].subido_en.getMonth() + 1).toString().padStart(2, '0')
        }/${c.comprobantes[0].subido_en.getFullYear()}`
      : undefined,
    creadoEn: `${c.created_at.getDate().toString().padStart(2, '0')}/${
      (c.created_at.getMonth() + 1).toString().padStart(2, '0')
    }/${c.created_at.getFullYear()}`,
  }));
}


// Generar cuotas (ADMIN)
export async function generarCuotas(
  data: GenerarCuotasRequest
): Promise<GenerarCuotasResponse> {
  const { actividadId, mes, montoBase, preview } = data;

  // 🔹 Traer socios activos
  const socios = await prisma.socio.findMany({
    where: { estado: 'ACTIVO' },
  });

  let created = 0;
  let updated = 0;
  let skips = 0;
  const previewItems: PreviewItem[] = [];

  // 🔹 Procesar cada socio
  for (const socio of socios) {
    // 1️⃣ Buscar sus actividades (todas o filtradas)
    const actividadesSocio = await prisma.actividadSocio.findMany({
      where: {
        socioId: socio.id,
        ...(actividadId ? { actividadId } : {}),
      },
      include: {
        actividad: {
          select: { id: true, nombre: true, monto: true, activo: true },
        },
      },
    });

    if (!actividadesSocio.length) {
      skips++;
      continue;
    }

    // 2️⃣ Calcular total y armar detalle
    const detalle: DetalleCuota[] = [];

    if (montoBase > 0) {
      detalle.push({ tipo: 'base' as const, monto: montoBase });
    }

    for (const a of actividadesSocio) {
      detalle.push({
        tipo: 'actividad' as const,
        id: a.actividad.id,
        nombre: a.actividad.nombre,
        monto: Number(a.actividad.monto),
      });
    }

    const total = detalle.reduce((acc, d) => acc + d.monto, 0);

    // 3️⃣ Si es solo previsualización → no toca BD
    if (preview) {
      previewItems.push({ socioId: socio.id, total, detalle });
      continue;
    }

    // 4️⃣ Ver si ya existe una cuota para ese mes
    const existente = await prisma.cuota.findFirst({
      where: { socio_id: socio.id, mes },
      include: { cuotaXactividad: true },
    });

    if (!existente) {
      // 5️⃣ Crear nueva cuota con detalle
      await prisma.cuota.create({
        data: {
          socio_id: socio.id,
          mes,
          monto: total,
          metodo_pago: $Enums.FormaDePago.EFECTIVO,
          estado: $Enums.estado_cuota.PENDIENTE,
          fecha_vencimiento: addDays(new Date(), 45),
          cuotaXactividad: {
            create: detalle
              .filter((d) => d.tipo === 'actividad')
              .map((d) => ({
                actividadId: d.id!,
                monto: d.monto,
              })),
          },
        },
      });
      created++;
    } else {
      // 6️⃣ Actualizar cuota existente
      await prisma.cuota.update({
        where: { id: existente.id },
        data: {
          monto: total,
          // Recalcular fecha de vencimiento en base a created_at
          fecha_vencimiento: addDays(existente.created_at, 45),
          cuotaXactividad: {
            deleteMany: {}, // limpiar previas
            create: detalle
              .filter((d) => d.tipo === 'actividad')
              .map((d) => ({
                actividadId: d.id!,
                monto: d.monto,
              })),
          },
        },
      });
      updated++;
    }
  }

  // 7️⃣ Devolver resultado
  return {
    processedSocios: socios.length,
    created,
    updated,
    skips,
    ...(preview ? { previewItems } : {}),
  };
}

// Eliminar cuota
export async function deleteCuota(id: number) {
  await prisma.cuota.delete({ where: { id } });
}

// Marcar cuotas vencidas (ADMIN/JOB)
export async function marcarCuotasVencidas(): Promise<{ updated: number }>{
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const res = await prisma.cuota.updateMany({
    where: {
      fecha_vencimiento: { lt: hoy },
      NOT: { estado: $Enums.estado_cuota.PAGADA },
    },
    data: { estado: $Enums.estado_cuota.VENCIDA },
  });

  return { updated: res.count };
}

