# Corregir subida comprobante cuota

- Fecha: 2026-08-04
- Titulo del PR: Corregir subida comprobante cuota
- Descripcion de los cambios: Se corrigio la carga de comprobantes de cuotas para aceptar archivos por extension y guardar localmente si falla Supabase Storage.
- Documentos relacionados: `frontend/src/components/AdjuntarComprobante.jsx`, `frontend/src/pages/CuotasTable.jsx`, `backend/src/services/cuotaService.ts`, `backend/src/app.ts`
- Autor: Codex

## Explicacion profunda de los cambios

El error reportado ocurria en `POST /api/cuotas/socio/:cuotaId/comprobante`, no en compra de entradas. El backend recibia el archivo y luego intentaba subirlo al bucket de Supabase `comprobante-cuota`. Si ese bucket no existe, no tiene permisos o la configuracion de Supabase falla, el service lanzaba un error que terminaba como `500 Internal Server Error`.

Se agrego un fallback local para desarrollo: si la subida a Supabase Storage falla, el backend guarda el archivo en `backend/uploads/comprobantes-cuotas/` y devuelve una URL bajo `/uploads/comprobantes-cuotas/...`, que ya queda servida por Express mediante `/uploads`.

Tambien se ajusto la validacion del modal de comprobante de cuotas para aceptar archivos por extension (`jpg`, `jpeg`, `png`, `pdf`) ademas del MIME type. Esto evita rechazar PDFs validos cuyo MIME venga vacio o generico desde el navegador.

Finalmente, `CuotasTable` ahora muestra el mensaje devuelto por backend cuando existe, en lugar de ocultarlo siempre detras de un mensaje generico.
