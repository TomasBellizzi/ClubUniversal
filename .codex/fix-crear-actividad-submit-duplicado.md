# Fix crear actividad submit duplicado

- Fecha: 2026-08-17
- Titulo del PR: Fix crear actividad submit duplicado
- Descripcion de los cambios: Se evito que el spam de clicks en Confirmar cree multiples actividades iguales.
- Documentos relacionados: AGENTS.md, frontend/src/pages/ActividadesAdmin.jsx, backend/src/services/actividad.service.ts
- Autor: Codex

## Explicacion profunda de los cambios

El formulario de alta de actividades ahora bloquea el submit de forma inmediata usando una referencia interna y un estado de carga. Esto evita que varios clicks rapidos sobre el boton Confirmar disparen multiples requests antes de que React alcance a repintar la pantalla.

Como defensa adicional, el backend valida que no exista otra actividad con el mismo nombre, ignorando mayusculas/minusculas y normalizando espacios. Si ya existe una actividad con ese nombre, la API responde con conflicto y no crea un duplicado. La misma validacion se aplica al editar una actividad para evitar renombrarla a un nombre ya existente.
