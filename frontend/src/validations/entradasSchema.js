import * as Yup from "yup";

export const entradaSchema = Yup.object().shape({
  cantidad: Yup.number()
    .typeError("La cantidad debe ser un numero")
    .integer("La cantidad debe ser un numero entero")
    .min(1, "La cantidad debe ser al menos 1")
    .required("La cantidad es obligatoria"),
});
