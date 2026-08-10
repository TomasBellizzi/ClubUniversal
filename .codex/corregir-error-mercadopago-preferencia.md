# Corregir error Mercado Pago preferencia

- Fecha: 2026-08-05
- Titulo del PR: Corregir error Mercado Pago preferencia
- Descripcion de los cambios: Se ajusto el manejo de errores de Mercado Pago para que la preferencia no falle con un 500 generico cuando falta configuracion o Mercado Pago rechaza la operacion.
- Documentos relacionados: `.codex/feature-mp-entradas.md`, `backend/src/services/mercadoPago.service.ts`, `backend/src/middlewares/error.middleware.ts`
- Autor: Codex

## Explicacion profunda de los cambios

Durante la prueba del deploy, el frontend recibia un error generico al llamar a `/api/eventos/:id/mercadopago/preferencia`. Segun el contexto de `feature-mp-entradas.md`, el flujo requiere variables de Render como `MERCADOPAGO_ACCESS_TOKEN`, `BACKEND_PUBLIC_URL` y `FRONTEND_URL`.

El backend ahora marca como errores operativos y visibles los casos donde falta configuracion de Mercado Pago o la API de Mercado Pago rechaza la creacion de preferencia. El middleware de errores conserva la proteccion general de errores internos, pero permite devolver mensajes controlados cuando el error trae `publicMessage`.

Esto no reemplaza la necesidad de configurar correctamente Render ni de correr migraciones Prisma cuando cambia el schema. La integracion de entradas con Mercado Pago requiere que la migracion `20260805120000_mercadopago_entradas` este aplicada en Supabase y que Render tenga las variables necesarias.
