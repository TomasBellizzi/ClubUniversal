# Fix actividades validaciones eliminacion

- Fecha: 2026-08-10
- Titulo del PR: Fix actividades validaciones eliminacion
- Descripcion de los cambios: Se limitaron montos de actividades, se evito la creacion duplicada por multiples clicks y se amplio la eliminacion definitiva de actividades.
- Documentos relacionados: `frontend/src/pages/ActividadesAdmin.jsx`, `frontend/src/validations/actividadSchema.js`, `backend/src/services/actividad.service.ts`, `backend/src/validations/actividades.validation.ts`
- Autor: Codex

## Explicacion profunda de los cambios

Se agrego un monto maximo de $10.000 para actividades en frontend y backend. El formulario administrativo muestra el limite y los esquemas de validacion impiden guardar montos mayores o no positivos.

Para evitar que multiples clicks creen varias actividades iguales, el boton de confirmacion queda deshabilitado durante el submit y el backend valida que no exista otra actividad con el mismo nombre, sin distinguir mayusculas/minusculas. Esto cubre tanto dobles clicks como requests repetidas desde otra pestaña o cliente.

La eliminacion definitiva ya existia como endpoint fisico en backend. Se amplio la UI para permitir usarla tanto en actividades activas como inactivas, alineando permisos visuales con la API para roles administrativos. El borrado logico sigue disponible mediante dar de baja/dar de alta.
