import * as yup from "yup";

export const ACTIVIDAD_MONTO_MAXIMO = 10000;

export const actividadSchema = yup.object().shape({
  nombre: yup
    .string()
    .required("El nombre es obligatorio")
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede superar los 100 caracteres"),

  monto: yup
    .number()
    .typeError("El monto debe ser un número")
    .required("El monto es obligatorio")
    .positive("El monto debe ser mayor a 0")
    .max(ACTIVIDAD_MONTO_MAXIMO, "El monto no puede superar $10.000"),
});
