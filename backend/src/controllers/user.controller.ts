import { Request, Response } from 'express';
import * as userService from '../services/user.service';
import { supabase } from '../utils/supabaseClient';

export async function getAllUsers(req: Request, res: Response) {
  try {
    const users = await userService.getAllUsers();
    return res.status(200).json({ users, total: users.length });
  } catch (error: any) {
    console.error('Error al obtener usuarios:', error);
    return res.status(500).json({ message: 'Error al obtener usuarios' });
  }
}

// Obtener todos los administrativos
export async function getAdministrativos(req: Request, res: Response) {
  try {
    const administrativos = await userService.getAdministrativos();
    res.json({
      success: true,
      data: administrativos,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener administrativos',
    });
  }
}

// Obtener todos los socios
export async function getSocios(req: Request, res: Response) {
  try {
    const socios = await userService.getAllSocios();
    res.json({ success: true, data: socios });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Error al obtener socios",
    });
  }
}

export async function getUserById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    const requester = req.user;

    if (!requester) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const isOwnUser = requester.id === id;
    const canReadOtherUsers = requester.role === 'ADMIN' || requester.role === 'ADMINISTRATIVO';

    if (!isOwnUser && !canReadOtherUsers) {
      return res.status(403).json({ message: 'No tiene permisos para ver este usuario' });
    }

    const user = await userService.getUserById(id);
    return res.status(200).json({ user });
  } catch (error: any) {
    console.error('Error al obtener usuario:', error);
    return res
      .status(error.statusCode || 404)
      .json({ message: error.message || 'Usuario no encontrado' });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const userId = parseInt(req.params.id);
    const requester = req.user;

    if (!requester) {
      return res.status(401).json({ success: false, message: "No autenticado" });
    }

    const targetUser = await userService.getUserById(userId);
    const isOwnUser = requester.id === userId;
    const isAdmin = requester.role === "ADMIN";
    const administCanManageSocio = requester.role === "ADMINISTRATIVO" && targetUser.role === "SOCIO";

    if (!isAdmin && !administCanManageSocio && !isOwnUser) {
      return res.status(403).json({ success: false, message: "No tiene permisos para modificar este usuario" });
    }

    let fotoCarnetUrl: string | undefined = undefined;

    if (req.file) {
      const ext = req.file.originalname.split(".").pop();
      const fileName = `foto-${userId}-${Date.now()}.${ext}`;

      const { data, error } = await supabase.storage
        .from("fotos-carnet")
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true,
        });

      if (error)
        throw new Error("Error al subir foto carnet: " + error.message);

      const { data: publicData } = supabase.storage
        .from("fotos-carnet")
        .getPublicUrl(fileName);

      fotoCarnetUrl = publicData.publicUrl;
    }

    const bodyData = normalizeMultipartBody(req.body);

    if (!isAdmin) {
      delete bodyData.role;
    }

    if (requester.role === "SOCIO" && bodyData.socio) {
      delete bodyData.socio.estado;
    }

    if (requester.role === "ADMINISTRATIVO" && isOwnUser && bodyData.administrativo) {
      delete bodyData.administrativo.activo;
    }

    if (fotoCarnetUrl) {
      if (!bodyData.socio) bodyData.socio = {};
      bodyData.socio.fotoCarnet = fotoCarnetUrl;
    }

    const updated = await userService.updateUser(userId, bodyData);

    res.json({
      success: true,
      message: "Usuario actualizado correctamente",
      data: updated,
    });
  } catch (error: any) {
    console.error("❌ Error en updateUser:", error);
    res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Error al actualizar usuario",
    });
  }
}

function normalizeMultipartBody(body: any) {
  const normalized = { ...body };

  for (const [key, value] of Object.entries(body)) {
    const match = key.match(/^(\w+)\[(\w+)\]$/);
    if (!match) continue;

    const [, group, field] = match;
    normalized[group] = {
      ...(normalized[group] && typeof normalized[group] === "object" ? normalized[group] : {}),
      [field]: value,
    };
    delete normalized[key];
  }

  return normalized;
}



export async function deleteUser(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    await userService.deleteUser(id);
    return res.status(200).json({ message: 'Usuario eliminado con éxito' });
  } catch (error: any) {
    console.error('Error al eliminar usuario:', error);
    return res
      .status(error.statusCode || 404)
      .json({ message: error.message || 'Error al eliminar usuario' });
  }
}
