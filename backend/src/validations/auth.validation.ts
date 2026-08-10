import { z } from 'zod';

export const LoginSchema = z.object({
  emailOdni: z.string().min(3, 'Debe ingresar un email o DNI'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const ChangeInitialPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'La contrasena debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayuscula')
      .regex(/[0-9]/, 'Debe contener al menos un numero'),
    confirmPassword: z.string().min(1, 'Debe repetir la contrasena'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contrasenas no coinciden',
  });
