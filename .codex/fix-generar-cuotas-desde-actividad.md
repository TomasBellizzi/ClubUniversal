# Fix generar cuotas desde actividad

- Fecha: 2026-08-13
- Titulo del PR: Fix generar cuotas desde actividad
- Descripcion de los cambios: Se quito el boton global de generacion de cuotas y se fijo la actividad cuando se genera desde una tarjeta de actividad.
- Documentos relacionados: `frontend/src/pages/CuotasAdminPage.jsx`, `frontend/src/pages/generarCuota.jsx`
- Autor: Codex

## Explicacion profunda de los cambios

El listado administrativo de cuotas ahora se organiza por actividad. Como cada tarjeta de actividad ya tiene su propio boton `Generar cuotas`, el boton global del encabezado resultaba ambiguo y duplicado. Se elimino ese boton superior para que la generacion siempre parta desde una actividad concreta.

Al navegar desde una tarjeta hacia la pantalla de generacion, ahora se envia tambien el nombre de la actividad junto con su id. La pantalla `generar-cuota` detecta ese origen y muestra la actividad como un dato fijo de solo lectura, manteniendo el `actividadId` oculto en el formulario para enviar la solicitud. Si el usuario entra a `generar-cuota` por otra ruta sin actividad previa, el selector sigue apareciendo normalmente.
