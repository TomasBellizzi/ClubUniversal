# Corregir login comprobantes footer cuotas

- Fecha: 2026-08-04
- Titulo del PR: Corregir login comprobantes footer cuotas
- Descripcion de los cambios: Se corrigio login por DNI para administrativos, subida de comprobantes de entradas, acceso al generador de cuotas, navegacion desde logo, footer de contacto y actualizacion de DNI administrativo.
- Documentos relacionados: `backend/src/services/auth.service.ts`, `backend/src/services/user.service.ts`, `frontend/src/components/Header.jsx`, `frontend/src/components/Footer.jsx`, `frontend/src/components/Layout.jsx`, `frontend/src/pages/CuotasAdminPage.jsx`, `frontend/src/pages/SocioEntradas.jsx`, `frontend/src/validations/entradasSchema.js`
- Autor: Codex

## Explicacion profunda de los cambios

El login por DNI solo buscaba socios. Se amplio la busqueda para que, si no encuentra un socio con ese DNI, busque tambien en `Administrativo` y luego resuelva el `Usuario` vinculado.

La actualizacion de usuarios ahora normaliza explicitamente `dni` a numero antes de enviarlo a Prisma, tanto para socios como administrativos. Esto reduce errores al actualizar datos desde formularios multipart donde los valores llegan como strings.

La compra de entradas acepta comprobantes `.png`, `.jpg`, `.jpeg` y `.pdf` desde el input y la validacion del frontend contempla tambien MIME `image/jpg`.

Se agrego un footer global con el nombre completo del club centrado y enlaces a Instagram, Facebook y Maps. Se quito el link de Contacto del header y el logo del club pasa a ser el acceso al home correspondiente segun rol.

Se reforzo el flujo de generacion de cuotas para que el boton siga visible en `cuotas-admin` y navegue a `/generar-cuota` cuando el rol detectado sea `ADMIN` o `ADMINISTRATIVO`. El CRUD de administrativos queda reservado para `ADMIN`.
