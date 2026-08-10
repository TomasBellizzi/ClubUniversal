# Fix eliminar actividades administrativo

- Fecha: 2026-08-10
- Titulo del PR: Fix eliminar actividades administrativo
- Descripcion de los cambios: Se restauro el boton de eliminacion fisica de actividades para usuarios administrativos y se dejo disponible tambien en actividades inactivas.
- Documentos relacionados: `frontend/src/pages/ActividadesAdmin.jsx`, `backend/src/routes/actividad.routes.ts`
- Autor: Codex

## Explicacion profunda de los cambios

El backend ya permitia eliminar actividades fisicamente con roles `ADMIN` y `ADMINISTRATIVO` mediante `DELETE /api/actividades/:id`. El problema estaba en el frontend: el boton `Eliminar` solo se mostraba para `ADMIN` y estaba dentro del bloque de actividades activas, por lo que desaparecia para administrativos comunes y tambien para actividades dadas de baja.

Se agrego una validacion de rol en la pantalla que contempla `ADMIN` y `ADMINISTRATIVO`, y el boton de eliminacion quedo fuera de la condicion activo/inactivo. Asi el administrativo conserva el borrado fisico ademas del borrado logico de dar de baja.
