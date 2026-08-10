# Fix rate limit rutas CodeQL

- Fecha: 2026-08-10
- Titulo del PR: Fix rate limit rutas CodeQL
- Descripcion de los cambios: Se agregaron rate limiters a rutas nuevas marcadas por CodeQL como endpoints autenticados sin limitacion de solicitudes.
- Documentos relacionados: `backend/src/middlewares/rateLimit.middleware.ts`, `backend/src/routes/auth.routes.ts`, `backend/src/routes/cuotaRoutes.ts`
- Autor: Codex

## Explicacion profunda de los cambios

CodeQL marco las rutas `PATCH /api/auth/change-initial-password` y `GET /api/cuotas/administrativo/actividades` como handlers con autorizacion pero sin rate limiting. Para resolverlo se extendio el middleware existente de rate limiting con dos limiters reutilizables.

`authSensitiveLimiter` aplica una politica mas estricta para operaciones sensibles de autenticacion, como el cambio obligatorio de contrasena inicial. `adminReadLimiter` aplica una politica mas amplia para lecturas administrativas, evitando abuso sin afectar el uso normal del panel.

Ambos middlewares se conectaron directamente en las rutas reportadas antes de la autenticacion/autorizacion, por lo que CodeQL puede detectar que los endpoints quedan protegidos contra exceso de solicitudes.
