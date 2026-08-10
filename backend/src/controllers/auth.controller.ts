import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import * as userService from '../services/user.service';
import { RegisterSchema } from '../validations/user.validation'; // asegúrate de importar bien

export async function login(req: Request, res: Response) {
  try {
    const result = await authService.login(req.body);

    res.json({
      success: true,
      data: result, 
    });
  } catch (err: any) {
    console.error("Error en login:", err);
    res.status(401).json({
      success: false,
      message: err.message || 'Error en login',
    });
  }
}

export async function changeInitialPassword(req: Request, res: Response) {
  try {
    const userId = Number(req.user?.id);
    if (!userId || Number.isNaN(userId)) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
    }

    const result = await authService.changeInitialPassword(userId, req.body);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || 'No se pudo cambiar la contrasena',
    });
  }
}

export async function register(req: Request, res: Response) {
  try {
    const parsed = RegisterSchema.parse(req.body);

    let user;

    if (parsed.role === 'SOCIO') {
      user = await userService.registerSocio({
        nombre: parsed.socio!.nombre,
        apellido: parsed.socio!.apellido,
        dni: parsed.socio!.dni,
        email: parsed.email,
        password: parsed.password,
        fechaNacimiento: parsed.socio!.fechaNacimiento.toISOString(), // importante
        sexo: parsed.socio!.sexo,
        pais: parsed.socio!.pais,
        fotoCarnet: parsed.socio!.fotoCarnet ?? null,
      });
    } else if (parsed.role === 'ADMINISTRATIVO') {
      user = await userService.createAdministrativo({
        email: parsed.email,
        password: parsed.password,
        role: parsed.role,
        administrativo: parsed.administrativo!,
      });
    } else {
      return res.status(400).json({ success: false, message: 'Rol no soportado' });
    }

    res.status(201).json({
      success: true,
      message: 'Registro exitoso',
      data: user,
    });
  } catch (error: any) {
    console.error("Error en register:", error);
    res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || 'Error en el registro',
      errors: error.errors || null,
    });
  }
}
