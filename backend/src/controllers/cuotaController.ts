
import { Request, Response, NextFunction } from 'express';
import * as cuotaService from '../services/cuotaService';
import { GetCuotasSocioResponse, GetCuotasAdministrativoResponse, GetCuotasActividadesResumenResponse, GetCuotasAdminResponse, EnviarComprobanteResponse, UpdateEstadoCuotaRequest, UpdateEstadoCuotaResponse, GenerarCuotasRequest, GenerarCuotasResponse, } from '../types/cuota';

// SOCIO
export async function getCuotasSocio(
  req: Request,
  res: Response<GetCuotasSocioResponse>,
  next: NextFunction
) {
  try {
    const socioIdRaw = (req as any).user?.socioId; // viene del token JWT
    const socioId = Number(socioIdRaw);
    if (!socioId || Number.isNaN(socioId)) {
      return res.status(400).json({ cuotas: [] as any });
    }
    const cuotas = await cuotaService.getCuotasSocio(socioId);
    res.json({ cuotas });
  } catch (error) {
    const msg = (error as any)?.message || String(error);
    console.error('[Cuotas] Error en getCuotasSocio:', msg);
    return res.status(500).json({ cuotas: [] });
  }
}

export async function enviarComprobante(
  req: Request,
  res: Response<EnviarComprobanteResponse>,
  next: NextFunction
) {
  try {
    const cuotaId = Number(req.params.cuotaId);
    const socioId = Number((req as any).user?.socioId);
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: 'No se proporcionó archivo' });
    if (!socioId || Number.isNaN(socioId)) {
      return res.status(400).json({ success: false, message: 'Socio no asociado al usuario' });
    }

    const response = await cuotaService.enviarComprobante(cuotaId, socioId, file);
    res.json(response);
  } catch (error) {
    next(error);
  }
}

// ADMINISTRATIVO
export async function getCuotasAdministrativo(
  req: Request,
  res: Response<GetCuotasAdministrativoResponse>,
  next: NextFunction
) {
  try {
    const filtros = req.query;
    const cuotas = await cuotaService.getCuotasAdministrativo(filtros);
    res.json({ cuotas });
  } catch (error) {
    next(error);
  }
}

export async function getCuotasActividadesResumen(
  req: Request,
  res: Response<GetCuotasActividadesResumenResponse>,
  next: NextFunction
) {
  try {
    const actividades = await cuotaService.getCuotasActividadesResumen();
    res.json({ actividades });
  } catch (error) {
    next(error);
  }
}

export async function updateEstadoCuota(
  req: Request<{ id: string }, {}, UpdateEstadoCuotaRequest>,
  res: Response<UpdateEstadoCuotaResponse>,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    const adminName = (req as any).user?.nombre || 'Administrador';
    const result = await cuotaService.updateEstadoCuota(id, req.body, adminName);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

// ADMIN
export async function getCuotasAdmin(
  req: Request,
  res: Response<GetCuotasAdminResponse>,
  next: NextFunction
) {
  try {
    const filtros = req.query;
    const cuotas = await cuotaService.getCuotasAdmin(filtros);
    res.json({ cuotas });
  } catch (error) {
    next(error);
  }
}

export async function generarCuotas(
  req: Request<{}, {}, GenerarCuotasRequest>,
  res: Response<GenerarCuotasResponse>,
  next: NextFunction
) {
  try {
    const body = req.body;

    const result = await cuotaService.generarCuotas({
      actividadId: body.actividadId ?? undefined, // opcional
      mes: body.mes,
      montoBase: body.montoBase ?? 0,
      fechaVencimiento: body.fechaVencimiento,
      preview: !!body.preview, 
      soloSinActividad: !!body.soloSinActividad,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error en generarCuotas controller:', error);
    return next(error);
  }
}

export async function deleteCuota(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    await cuotaService.deleteCuota(id);
    res.json({ success: true, message: 'Cuota eliminada' });
  } catch (error) {
    next(error);
  }
}

// ADMIN: ejecutar actualización de cuotas vencidas
export async function runVencimiento(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await cuotaService.marcarCuotasVencidas();
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}
