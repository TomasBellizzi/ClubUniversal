import * as Yup from "yup";

const formatosPermitidos = ["png", "jpg", "jpeg", "pdf"];
const mimePermitidos = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];

function esArchivoPermitido(file) {
  if (!file) return false;
  const extension = file.name?.split(".").pop()?.toLowerCase();
  return mimePermitidos.includes(file.type) || formatosPermitidos.includes(extension);
}

export const entradaSchema = Yup.object().shape({
  cantidad: Yup.number()
    .min(1, "La cantidad debe ser al menos 1")
    .required("La cantidad es obligatoria"),
  comprobante: Yup.mixed()
    .required("Debes adjuntar el comprobante")
    .test("fileSize", "El archivo es demasiado grande", (value) =>
      !value || (value && value[0]?.size <= 5 * 1024 * 1024) 
    )
    .test("fileType", "Formato no soportado", (value) =>
      !value ||
      esArchivoPermitido(value[0])
    ),
}); 
