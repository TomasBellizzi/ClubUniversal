# Corregir redireccion Mercado Pago entradas

- Fecha: 2026-08-10
- Titulo del PR: Corregir redireccion Mercado Pago entradas
- Descripcion de los cambios: Se reforzo el flujo de creacion de preferencias de Mercado Pago para entradas y se mejoro el error visible en frontend.
- Documentos relacionados: `.codex/feature-mp-entradas.md`, `.codex/corregir-error-mercadopago-preferencia.md`, `backend/src/services/mercadoPago.service.ts`, `frontend/src/pages/SocioEntradas.jsx`
- Autor: Codex

## Explicacion profunda de los cambios

Se reviso el flujo completo de entradas para Mercado Pago y se ajusto el backend para validar antes de crear la entrada pendiente que existan `MERCADOPAGO_ACCESS_TOKEN`, `BACKEND_PUBLIC_URL` y `FRONTEND_URL`. En produccion, `BACKEND_PUBLIC_URL` y `FRONTEND_URL` ya no pueden quedar vacias ni apuntar a `localhost`, porque Mercado Pago necesita URLs publicas para `back_urls` y `notification_url`.

Si Mercado Pago rechaza la creacion de la preferencia despues de crear la entrada pendiente, la entrada se marca como `CANCELADA` con estado interno `PREFERENCE_ERROR`. Esto evita que queden intentos pendientes inutiles tras un error de API.

Tambien se detecta explicitamente el caso de base de datos sin la migracion `20260805120000_mercadopago_entradas` aplicada. Si Prisma falla por columnas o enums faltantes relacionados con Mercado Pago, el backend devuelve un error operativo indicando que hay que ejecutar `prisma migrate deploy` antes de probar el pago en Render.

El frontend ahora muestra el campo `error` devuelto por el middleware del backend, que es el campo disponible en produccion para mensajes controlados. Esto permite distinguir rapidamente si el problema es falta de variable de entorno, URL invalida, rechazo de Mercado Pago o un error interno real.

Durante la revision posterior se normalizo la construccion de URLs de API en `SocioEntradas.jsx`, quitando la dependencia directa de interpolar `VITE_API_URL` en cada endpoint. Ahora se elimina una barra final si existe, se usa `localhost:3000` en desarrollo cuando falta la variable y en produccion se conserva el fallback relativo `/api`.


Tambien se reviso la carga inicial de `Mis Entradas` y `Proximos Eventos`. La pantalla ya no muestra `alert()` por errores transitorios de cargas automaticas, algo especialmente molesto en desarrollo con React `StrictMode`, donde los efectos pueden ejecutarse mas de una vez. En su lugar usa estados de carga y mensajes inline solo cuando no hay datos para mostrar. El controlador de entradas ahora delega errores al middleware comun para mantener respuestas normalizadas.

Se ajusto el texto del modal de compra para no mencionar cuentas de prueba. El mensaje ahora indica de forma neutral que el socio sera redirigido a Mercado Pago para completar el pago.

Tambien se agrego `backend/README.md` al `.gitignore`, manteniendo la decision de no versionar ese archivo porque contiene datos locales sensibles de acceso.
