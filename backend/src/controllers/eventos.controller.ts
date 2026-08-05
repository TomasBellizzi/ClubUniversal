import { CreateEventoRequest, UpdateEventoRequest, EventoListResponse, EventoResponse } from "../types/evento";
import { Request, Response, NextFunction } from 'express';
import * as eventoService from '../services/evento.service';
import { FormaDePago } from "@prisma/client";
import { supabase } from "../utils/supabaseClient";
import * as mercadoPagoService from "../services/mercadoPago.service";

export async function getAllEvento(
  req: Request,
  res: Response<EventoListResponse>,
  next: NextFunction
) {
  try {
    const eventos = await eventoService.getAllEventos(); 
    res.json({
      eventos,
      total: eventos.length
    });
  } catch (error) {
    console.error("Error en getAllEvento:", error);
    next(error);
  }
}

export async function getEventoById(req: Request, res: Response<any>, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }
    const evento = await eventoService.getEventoById(id);
    res.json(evento);
  } catch (error) {
    next(error);
  }
}

export async function createEvento(
  req: Request<{}, EventoResponse, CreateEventoRequest>,
  res: Response<EventoResponse>,
  next: NextFunction
) {
  try {
    const newEvento = await eventoService.createEvento(req.body);
    res.status(201).json(newEvento);
  } catch (error) {
    next(error);
  }
}

export async function updateEvento(
  req: Request<{ id: string }, {}, UpdateEventoRequest>,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }
    const updatedEvento = await eventoService.updateEvento(id, req.body);
    res.status(200).json({
      evento: updatedEvento,
      message: 'Evento updated successfully'
    });
  } catch (error) {
    next(error);
  }
}


export async function registrarVenta(
  req: Request<{}, {}, { eventoId: number; cantidad: number; socioId?: number; formaDePago: FormaDePago }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { eventoId, cantidad, socioId, formaDePago } = req.body;
    const socioIdAutenticado = req.user?.role === "SOCIO" ? req.user.socioId ?? undefined : undefined;

    // Subida del comprobante si se adjuntó archivo
    let comprobanteUrl: string | null = null;

    if (req.file) {
      const ext = req.file.originalname.split(".").pop();
      const fileName = `comprobante-${Date.now()}.${ext}`;

      const { data, error } = await supabase.storage
        .from("comprobante-entradas") 
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (error) {
        throw new Error("Error al subir el comprobante: " + error.message);
      }

      const { data: publicData } = supabase.storage
        .from("comprobante-entradas")
        .getPublicUrl(fileName);

      comprobanteUrl = publicData.publicUrl;
    }

    // Conversión de tipos
    const eventoIdNum = Number(eventoId);
    const cantidadNum = Number(cantidad);
    const socioIdNum = socioIdAutenticado ?? (socioId ? Number(socioId) : undefined);

    // Llamada al service
    const venta = await eventoService.registrarVenta(
      eventoIdNum,
      cantidadNum,
      formaDePago,
      socioIdNum,
      comprobanteUrl
    );

    res.status(201).json(venta);
  } catch (error) {
    next(error);
  }
}



export async function deleteEvento(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }
    await eventoService.deleteEvento(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function crearPreferenciaMercadoPago(req: Request, res: Response, next: NextFunction) {
  try {
    const eventoId = Number(req.params.id);
    const cantidad = Number(req.body?.cantidad);
    const socioId = req.user?.socioId;

    if (req.user?.role !== "SOCIO" || !socioId) {
      return res.status(403).json({ message: "Solo socios pueden comprar entradas online" });
    }

    const preference = await mercadoPagoService.crearPreferenciaEntrada(eventoId, cantidad, socioId);
    res.status(201).json(preference);
  } catch (error) {
    next(error);
  }
}

export async function conciliarMercadoPago(req: Request, res: Response, next: NextFunction) {
  try {
    const entradaId = Number(req.params.entradaId);
    const socioId = req.user?.socioId;

    if (req.user?.role !== "SOCIO" || !socioId) {
      return res.status(403).json({ message: "Solo socios pueden consultar sus pagos online" });
    }

    if (!Number.isInteger(entradaId) || entradaId <= 0) {
      return res.status(400).json({ message: "ID de entrada invalido" });
    }

    const entrada = await mercadoPagoService.conciliarEntradaMercadoPago(entradaId, socioId);
    res.json({ entrada });
  } catch (error) {
    next(error);
  }
}

export async function retornoMercadoPago(req: Request, res: Response, next: NextFunction) {
  try {
    const entradaId = Number(req.query.entradaId);
    const status = String(req.query.status || "");
    const paymentId = req.query.payment_id ? String(req.query.payment_id) : undefined;
    const collectionStatus = req.query.collection_status ? String(req.query.collection_status) : undefined;

    if (!Number.isInteger(entradaId) || entradaId <= 0) {
      return res.redirect(mercadoPagoService.construirUrlFrontendResultado("error"));
    }

    const entrada = await mercadoPagoService.confirmarRetornoEntrada(entradaId, paymentId, collectionStatus);
    const estado = entrada.estado === "PAGADA" ? "success" : status || "pending";

    res.redirect(mercadoPagoService.construirUrlFrontendResultado(estado, entrada.id));
  } catch (error) {
    next(error);
  }
}

export async function webhookMercadoPago(req: Request, res: Response, next: NextFunction) {
  try {
    const type = String(req.query.type || req.body?.type || "");
    const paymentId = req.query["data.id"] || req.body?.data?.id;

    if (type === "payment" && paymentId) {
      await mercadoPagoService.confirmarPagoPorPaymentId(String(paymentId));
    }

    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
}
