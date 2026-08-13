// src/types/cuota.ts
import type { $Enums } from '@prisma/client';

// ---------------- ENUMS BASE ----------------
export type Mes = $Enums.Mes;
export type EstadoCuota = $Enums.estado_cuota; // 'PENDIENTE' | 'VENCIDA' | 'PAGADA' | 'EN_REVISION'

// ---------------- DTOs POR ROL ----------------

// ---- SOCIO ----
export interface CuotaSocioDTO {
  id: number;
  mes: Mes;
  monto: number;
  estado: EstadoCuota;
  comprobanteUrl?: string;
  fechaCarga?: string;
  fechaVencimiento?: string;
  message?: string;
}

// ---- ADMINISTRATIVO ----
export interface CuotaAdministrativoDTO {
  id: number;
  socioId?: number;
  socioNombre: string;
  dni?: number;
  mes: Mes;
  monto: number;
  estado: EstadoCuota;
  comprobanteUrl?: string;
  fechaCarga?: string;
  motivoRevision?: string;
  fechaVencimiento?: string; // opcional
  metodoPago?: $Enums.FormaDePago; // opcional
  actividadIds?: number[];
  actividades?: {
    id: number;
    nombre: string;
    monto: number;
  }[];
}

export interface ActividadCuotasResumenDTO {
  id: number;
  nombre: string;
  monto: number;
  activo: boolean;
  sociosInscriptos: number;
  cuotasTotales: number;
  cuotasPendientes: number;
  cuotasEnRevision: number;
  cuotasPagadas: number;
  cuotasVencidas: number;
}

// ---- ADMINISTRADOR ----
export interface CuotaAdminDTO extends CuotaAdministrativoDTO {
  socioId: number;
  creadoEn?: string;
  ultimaModificacion?: string;
}

// ---------------- REQUESTS / RESPONSES ----------------

// ------- SOCIO -------
export interface GetCuotasSocioResponse {
  cuotas: CuotaSocioDTO[];
}

export interface EnviarComprobanteRequest {
  comprobante: Express.Multer.File;
}

export interface EnviarComprobanteResponse {
  success: boolean;
  message?: string;
  url?: string;
}

// ------- ADMINISTRATIVO -------
export interface GetCuotasAdministrativoQuery {
  estado?: EstadoCuota | 'Todas';
  nombre?: string;
  actividadId?: string | number;
  socioId?: string | number;
}

export interface GetCuotasAdministrativoResponse {
  cuotas: CuotaAdministrativoDTO[];
}

export interface GetCuotasActividadesResumenResponse {
  actividades: ActividadCuotasResumenDTO[];
}

export interface UpdateEstadoCuotaRequest {
  estado: 'Aprobada' | 'Rechazada';
  motivo?: string;
}

export interface UpdateEstadoCuotaResponse {
  id: number;
  estado: 'Aprobada' | 'Rechazada';
  fechaCambio: string;
  cambiadoPor: string;
  message?: string;
}

// ------- ADMIN -------
export interface GetCuotasAdminResponse {
  cuotas: CuotaAdminDTO[];
}

export interface GenerarCuotasRequest {
  actividadId?: number; // ahora opcional, coincide con tu controller
  mes: Mes;
  montoBase: number;
  preview?: boolean;
}

export type DetalleCuota = {
  tipo: 'base' | 'actividad';
  id?: number;
  nombre?: string;
  monto: number;
};

export interface PreviewItem {
  socioId: number;
  total: number;
  detalle: DetalleCuota[];
}

export interface GenerarCuotasResponse {
  processedSocios: number;
  created: number;
  updated: number;
  skips: number;
  previewItems?: PreviewItem[];
}

export interface UpsertPorSocioResult {
  socioId: number;
  created: boolean;
  updated: boolean;
  skipped?: boolean;
}

// ------- COMPROBANTE (ADMIN / ADMINISTRATIVO) -------
export interface GetComprobanteDetalleResponse {
  id: number;              // ID de la cuota
  socioNombre: string;     // Nombre completo del socio
  mes: Mes;                // Mes de la cuota
  monto: number;           // Importe
  estado: EstadoCuota;     // Estado actual
  comprobanteUrl?: string; // URL del comprobante (si existe)
  fechaCarga?: string;     // Fecha de subida
  message?: string;        // Mensaje opcional
}
