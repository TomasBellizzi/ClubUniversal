import { CreateEntradaRequest, UpdateEntradaRequest, EntradaResponse } from "../types/entradas";
import { Request, Response, NextFunction} from 'express';
import * as entradaService from '../services/entradas.service';

export async function getAllEntradas(req: Request, res: Response, next: NextFunction) {
  try {
    const { socioId } = req.query;
    const requester = req.user;

    if (requester?.role === "SOCIO") {
      if (!requester.socioId) return res.status(400).json({ error: "Socio no asociado al usuario" });
      const entradas = await entradaService.getEntradasBySocioId(requester.socioId);
      return res.json({ entradas });
    }

    if (socioId) {
      const entradas = await entradaService.getEntradasBySocioId(Number(socioId));
      return res.json({ entradas });
    }

    const entradas = await entradaService.getAllEntradas();
    res.json({ entradas });
  } catch (err) {
    next(err);
  }
}

export async function getEntradaById(req: Request, res: Response<EntradaResponse>, next: NextFunction) {
  try{
    const { id } = req.params;
    const entradaId = parseInt(id);
    if (isNaN(entradaId)) {
      const error = new Error("ID parameter is invalid");
      (error as any).statusCode = 400;
      throw error;
    }
    const entrada = await entradaService.getEntradaById (entradaId);
    res.json({
      entrada,
      message: "Entrada retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
}


export async function createEntrada(
  req: Request<{}, EntradaResponse, CreateEntradaRequest>,
  res: Response<EntradaResponse>,
  next: NextFunction
) {
  try {
    const newEntrada = await entradaService.createEntrada(req.body);
    res.status(201).json({
        entrada: newEntrada,
        message: 'Entrada created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

export async function updateEntrada(
  req: Request<{ id: string }, EntradaResponse, UpdateEntradaRequest>,
  res: Response<EntradaResponse>,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const entradaId = parseInt(id, 10);
    if (Number.isNaN(entradaId)) {
      const error = new Error("ID parameter is invalid");
      (error as any).statusCode = 400;
      throw error;
    }

    const updatedEntrada = await entradaService.updateEntrada(entradaId, req.body);

    res.json({
      entrada: updatedEntrada,
      message: 'Entrada updated successfully'
    });
  } catch (error) {
    next(error);
  }
}
