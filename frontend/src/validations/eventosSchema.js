import * as yup from "yup";

export const eventoSchema = yup.object().shape({
  nombre: yup
    .string()
    .required("El nombre es obligatorio")
    .min(3, "El nombre debe tener al menos 3 caracteres"),

  fecha: yup
    .date()
    .required("La fecha es obligatoria")
    .typeError("Debe ser una fecha válida"),

  horaInicio: yup.string().required("La hora de inicio es obligatoria"),
  horaFin: yup.string().required("La hora de fin es obligatoria"),

  capacidad: yup
    .number()
    .typeError("La capacidad debe ser un número")
    .required("La capacidad es obligatoria")
    .positive("La capacidad debe ser mayor a 0")
    .integer("La capacidad debe ser un número entero"),

  precioEntrada: yup
    .number()
    .typeError("El precio debe ser un número")
    .required("El precio es obligatorio")
    .positive("El precio debe ser mayor a 0"),

  actividadId: yup
    .number()
    .typeError("Debe seleccionar una actividad")
    .required("La actividad es obligatoria"),

  ubicacion: yup
    .string()
    .max(120, "La ubicación no puede superar los 120 caracteres")
    .nullable(),

  descripcion: yup
    .string()
    .max(500, "La descripción no puede superar los 500 caracteres")
    .nullable(),
});
