import prisma from '../config/prisma';
import { Sexo, paisesLatam } from '@prisma/client';
import bcrypt from 'bcrypt';
import { CreateUserRequest, UpdateUserRequest, UserData } from '../types/user';

const SALT_ROUNDS = 10;

// Obtener todos los usuarios
export async function getAllUsers(limit: number = 10): Promise<UserData[]> {
  const users = await prisma.usuario.findMany({
    take: limit,
    orderBy: { id: "asc" },
    include: { socio: true, administrativo: true },
  });

  return users.map(({ password, ...u }) => ({
    ...u,
    role: u.rol as "ADMIN" | "SOCIO" | "ADMINISTRATIVO",
    socio: u.socio
      ? { ...u.socio, estado: u.socio.estado as "ACTIVO" | "INACTIVO" }
      : null,
  }));
}

// Obtener todos los administrativos
export async function getAdministrativos(): Promise<UserData[]> {
  const administrativos = await prisma.usuario.findMany({
    where: { rol: "ADMINISTRATIVO" },
    include: { administrativo: true },
  });

  return administrativos.map(({ password, ...resto }) => ({
    ...resto,
    role: resto.rol as "ADMIN" | "SOCIO" | "ADMINISTRATIVO",
  }));
}

// Obtener todos los socios
export async function getAllSocios(): Promise<UserData[]> {
  const socios = await prisma.usuario.findMany({
    where: { rol: "SOCIO" },
    include: { socio: true },
  });

  return socios.map(({ password, ...u }) => ({
    ...u,
    role: u.rol as "ADMIN" | "SOCIO" | "ADMINISTRATIVO",
    socio: u.socio
      ? { ...u.socio, estado: u.socio.estado as "ACTIVO" | "INACTIVO" }
      : null,
  }));
}

// Obtener un usuario por ID
export async function getUserById(id: number): Promise<UserData> {
  const user = await prisma.usuario.findUnique({
    where: { id },
    include: { socio: true, administrativo: true },
  });

  if (!user) {
    const error = new Error("Usuario no encontrado") as any;
    error.statusCode = 404;
    throw error;
  }

  const { password, ...userWithoutPassword } = user;
  return {
    ...userWithoutPassword,
    role: user.rol as "ADMIN" | "SOCIO" | "ADMINISTRATIVO",
    socio: user.socio
      ? { ...user.socio, estado: user.socio.estado as "ACTIVO" | "INACTIVO" }
      : null,
  };
}



// Crear usuario
export async function createAdministrativo(data: CreateUserRequest): Promise<UserData> {
  const exists = await prisma.usuario.findUnique({ where: { email: data.email } });
  if (exists) {
    const error = new Error('Email ya registrado') as any;
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  const newUser = await prisma.usuario.create({
    data: {
      email: data.email,
      password: hashedPassword,
      rol: 'ADMINISTRATIVO',
      administrativo: data.administrativo
        ? {
            create: {
              nombre: data.administrativo.nombre,
              apellido: data.administrativo.apellido,
              dni: Number(data.administrativo.dni),
              activo: true, 
            },
          }
        : undefined,
    },
    include: { administrativo: true },
  });

  const { password, ...userWithoutPassword } = newUser;
  return {
    ...userWithoutPassword,
    role: newUser.rol as 'ADMIN' | 'SOCIO' | 'ADMINISTRATIVO',
  };
}


export async function updateUser(
  id: number,
  data: any,
): Promise<UserData> {
  const updateData: any = { ...data };

  if (data.role) {
    updateData.rol = data.role;
    delete updateData.role;
  }

  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, SALT_ROUNDS);
  }

  if (data.socio) {
    updateData.socio = {
      update: {
        ...data.socio,
        ...(data.fotoCarnet && { fotoCarnet: data.fotoCarnet }),
      },
    };
  }

  if (data.administrativo) {
    updateData.administrativo = {
      update: data.administrativo,
    };
  }

  const updatedUser = await prisma.usuario.update({
    where: { id },
    data: updateData,
    include: { socio: true, administrativo: true },
  });

  const { password, ...userWithoutPassword } = updatedUser;
  return {
    ...userWithoutPassword,
    role: updatedUser.rol as "ADMIN" | "SOCIO" | "ADMINISTRATIVO",
    socio: updatedUser.socio
      ? { ...updatedUser.socio, estado: updatedUser.socio.estado as "ACTIVO" | "INACTIVO" }
      : null,
  };
}

// Eliminar usuario 
export async function deleteUser(id: number): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // Buscar usuario
    const user = await tx.usuario.findUnique({
      where: { id },
      include: { socio: true, administrativo: true },
    });

    if (!user) {
      const error = new Error("Usuario no encontrado") as any;
      error.statusCode = 404;
      throw error;
    }

    //Si es SOCIO, eliminar dependencias
    if (user.socio) {
      const socioId = user.socio.id;

      // Eliminar entradas del socio
      await tx.entrada.deleteMany({ where: { socioId } });

      // Eliminar cuotas y sus comprobantes
      const cuotas = await tx.cuota.findMany({ where: { socio_id: socioId } });
      const cuotaIds = cuotas.map((c) => c.id);

      if (cuotaIds.length > 0) {
        await tx.comprobante.deleteMany({ where: { cuotaId: { in: cuotaIds } } });
        await tx.cuotaXactividad.deleteMany({ where: { cuotaId: { in: cuotaIds } } });
        await tx.cuota.deleteMany({ where: { id: { in: cuotaIds } } });
      }

      // Eliminar relaciones de actividad
      await tx.actividadSocio.deleteMany({ where: { socioId } });

      // Finalmente eliminar el socio
      await tx.socio.delete({ where: { id: socioId } });
    }

    // Si es ADMINISTRATIVO, eliminarlo
    if (user.administrativo) {
      await tx.administrativo.delete({ where: { id: user.administrativo.id } });
    }

    // Finalmente eliminar el usuario
    await tx.usuario.delete({ where: { id } });
  });
}


// Registrar socio
export async function registerSocio(data: {
  nombre: string;
  apellido: string;
  dni: number;
  email: string;
  password: string;
  fechaNacimiento: string;
  sexo: Sexo;
  pais: paisesLatam;
  fotoCarnet?: string | null;
}): Promise<UserData> {
  const exists = await prisma.usuario.findUnique({ where: { email: data.email } });
  if (exists) {
    const error = new Error("Email ya registrado") as any;
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  const newUser = await prisma.usuario.create({
    data: {
      email: data.email,
      password: hashedPassword,
      rol: "SOCIO",
      socio: {
        create: {
          nombre: data.nombre,
          apellido: data.apellido,
          dni: data.dni,
          fechaNacimiento: new Date(data.fechaNacimiento),
          pais: data.pais,
          sexo: data.sexo,
          fotoCarnet: data.fotoCarnet ?? null,
          email: data.email,
        },
      },
    },
    include: { socio: true },
  });

  const { password, ...userWithoutPassword } = newUser;
  return {
    ...userWithoutPassword,
    role: "SOCIO",
    socio: newUser.socio
      ? { ...newUser.socio, estado: newUser.socio.estado as "ACTIVO" | "INACTIVO" }
      : null,
  };
}
