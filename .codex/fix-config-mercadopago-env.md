# Fix config Mercado Pago env

- Fecha: 2026-08-13
- Titulo del PR: Fix config Mercado Pago env
- Descripcion de los cambios: Se hizo tolerante la lectura del access token de Mercado Pago para aceptar los dos nombres usados durante la configuracion.
- Documentos relacionados: AGENTS.md, backend/src/services/mercadoPago.service.ts
- Autor: Codex

## Explicacion profunda de los cambios

El deploy de Render tenia configurado `MERCADO_PAGO_ACCESS_TOKEN`, mientras que una version previa del servicio leia `MERCADOPAGO_ACCESS_TOKEN`. Esa diferencia hacia que el backend respondiera errores 503 indicando que faltaba el token, aunque el valor estuviera cargado en Render.

Se agrego una funcion dedicada para obtener el access token de Mercado Pago que acepta `MERCADO_PAGO_ACCESS_TOKEN` como nombre principal y `MERCADOPAGO_ACCESS_TOKEN` como alias compatible. De esta forma el backend funciona con la variable usada en Render y tambien conserva compatibilidad con entornos que hayan cargado el nombre anterior.
