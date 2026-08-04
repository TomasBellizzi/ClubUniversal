import prisma from '../config/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { LoginRequest } from '../types/auth';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET no configurado');
  return secret;
}

export async function login(data: LoginRequest) {
  const { emailOdni, password } = data;
  let usuario;

  // Buscar usuario según email o DNI
  if (/^\d+$/.test(emailOdni)) {
    // Por DNI
    const socio = await prisma.socio.findUnique({
      where: { dni: parseInt(emailOdni, 10) },
    });

    if (socio) {
      usuario = await prisma.usuario.findUnique({
        where: { id: socio.usuarioId },
        include: {
          socio: true,
          administrativo: true,
        },
      });
    } else {
      const administrativo = await prisma.administrativo.findUnique({
        where: { dni: parseInt(emailOdni, 10) },
      });

      if (!administrativo) throw new Error("Credenciales inválidas");

      usuario = await prisma.usuario.findUnique({
        where: { id: administrativo.usuarioId },
        include: {
          socio: true,
          administrativo: true,
        },
      });
    }
  } else {
    // Por email
    usuario = await prisma.usuario.findUnique({
      where: { email: emailOdni },
      include: {
        socio: true,
        administrativo: true,
      },
    });
  }

  if (!usuario) throw new Error("Credenciales inválidas");

  // ⚠️ Validar estado de socio o administrativo
  if (usuario.socio && usuario.socio.estado !== "ACTIVO") {
    throw new Error("Tu cuenta de socio está inactiva.");
  }

  if (usuario.administrativo && usuario.administrativo.activo === false) {
    throw new Error("Tu cuenta de administrativo está inactiva.");
  }

  // Validar contraseña
  const passwordValida = await bcrypt.compare(password, usuario.password);
  if (!passwordValida) throw new Error("Credenciales inválidas");

  // Generar token
  const token = jwt.sign(
    { id: usuario.id, socioId: usuario.socio?.id, role: usuario.rol.toUpperCase() },
    getJwtSecret(),
    { expiresIn: "1h" }
  );

  const { password: _, ...resto } = usuario;
  return {
    token,
    user: {
      id: resto.id,
      email: resto.email,
      role: resto.rol.toUpperCase(),
      socio: resto.socio,
      administrativo: resto.administrativo,
    },
  };
}
