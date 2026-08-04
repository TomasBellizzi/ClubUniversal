# Corregir validacion PDF comprobante entrada

- Fecha: 2026-08-04
- Titulo del PR: Corregir validacion PDF comprobante entrada
- Descripcion de los cambios: Se ajusto la validacion frontend de comprobantes de entrada para aceptar archivos permitidos por extension ademas de MIME type.
- Documentos relacionados: `frontend/src/validations/entradasSchema.js`, `frontend/src/pages/SocioEntradas.jsx`
- Autor: Codex

## Explicacion profunda de los cambios

La compra de entradas validaba el comprobante usando exclusivamente `file.type`. Algunos navegadores o archivos PDF generados localmente pueden informar un MIME vacio o generico, aunque el nombre termine correctamente en `.pdf`.

Para evitar falsos rechazos, la validacion ahora acepta el archivo si cumple alguna de estas condiciones: MIME permitido (`image/jpeg`, `image/jpg`, `image/png`, `application/pdf`) o extension permitida (`png`, `jpg`, `jpeg`, `pdf`).

El contenido del archivo no se inspecciona como "comprobante real"; solo se valida formato y tamano. Por eso un PDF menor a 5 MB con extension `.pdf` debe pasar la validacion frontend aunque el MIME no venga como `application/pdf`.
