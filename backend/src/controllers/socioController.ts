import { Request, Response, NextFunction } from "express";
import * as socioService from "../services/socioService";

export async function getSocioByDni(req: Request, res: Response) {
  const dni = Number(req.params.dni);
  if (Number.isNaN(dni)) return res.status(400).json({ error: "DNI invalido" });

  try {
    const socio = await socioService.getSocioCompletoByDni(dni);
    if (!socio) return res.status(404).json({ error: "Socio no encontrado" });
    res.json(socio);
  } catch (error) {
    console.error("Error al buscar socio:", error);
    res.status(500).json({ error: "Error al buscar socio" });
  }
}

export async function getAllSocios(req: Request, res: Response, next: NextFunction) {
  try {
    const socios = await socioService.getAllSocios();
    res.json({ socios });
  } catch (error) {
    next(error);
  }
}

export async function getSocioCompletoByDni(req: Request, res: Response) {
  const dni = Number(req.params.dni);
  if (Number.isNaN(dni)) return res.status(400).json({ error: "DNI invalido" });

  try {
    const socio = await socioService.getSocioCompletoByDni(dni);
    if (!socio) return res.status(404).json({ error: "Socio no encontrado" });
    res.json(socio);
  } catch (error) {
    console.error("Error al buscar socio:", error);
    res.status(500).json({ error: "Error al buscar socio" });
  }
}

export async function updateSocio(req: Request, res: Response) {
  const { dni } = req.body;
  const foto = req.file;

  try {
    const fotoPath = foto ? `/uploads/${foto.filename}` : null;
    const socioActualizado = await socioService.updateSocio(Number(dni), req.body, fotoPath);
    res.json(socioActualizado);
  } catch (error) {
    console.error("Error al actualizar socio:", error);
    res.status(500).json({ error: "Error al actualizar socio" });
  }
}

export async function updateSocioEstado(req: Request, res: Response) {
  const { id } = req.params;
  const { estado } = req.body;

  if (!estado || (estado !== "ACTIVO" && estado !== "INACTIVO")) {
    return res.status(400).json({
      message: "El estado proporcionado no es valido. Debe ser 'ACTIVO' o 'INACTIVO'.",
    });
  }

  try {
    const socioActualizado = await socioService.updateSocioEstado(Number(id), estado);
    res.status(200).json(socioActualizado);
  } catch (error: any) {
    console.error("Error al actualizar el estado del socio:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: `Socio con id ${id} no encontrado.` });
    }
    res.status(500).json({ message: "Error interno del servidor al actualizar el estado." });
  }
}
