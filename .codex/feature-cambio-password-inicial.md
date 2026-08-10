# Feature cambio password inicial

- Fecha: 2026-08-10
- Titulo del PR: Feature cambio password inicial
- Descripcion de los cambios: Se agrego el cambio obligatorio de contrasena para socios en su primer inicio de sesion.
- Documentos relacionados: `backend/prisma/schema.prisma`, `backend/prisma/migrations/20260810200000_usuario_cambio_password_inicial/migration.sql`, `backend/src/services/auth.service.ts`, `backend/src/controllers/auth.controller.ts`, `backend/src/routes/auth.routes.ts`, `frontend/src/pages/IniciarSesion.jsx`, `frontend/src/pages/CambiarPasswordInicial.jsx`, `frontend/src/components/PrivateRoute.jsx`, `frontend/src/App.jsx`
- Autor: Codex

## Explicacion profunda de los cambios

Se agrego el campo `requiereCambioPassword` al modelo `Usuario`. La migracion lo inicializa en `true` para usuarios con rol `SOCIO` y en `false` para el resto por defecto. A partir de ahora, cuando se registra un socio nuevo, queda marcado para cambiar la contrasena inicial en su primer ingreso.

El login devuelve el flag `requiereCambioPassword` junto con los datos del usuario. Si el flag esta activo, el frontend redirige a una pantalla obligatoria donde el usuario debe ingresar y repetir una nueva contrasena. El endpoint autenticado `PATCH /api/auth/change-initial-password` valida la nueva contrasena, verifica que sea distinta a la actual, guarda el hash y desactiva el flag.

Luego del cambio exitoso, el frontend cierra la sesion y vuelve al login para que el socio ingrese nuevamente con su contrasena definitiva. Las rutas privadas tambien bloquean el acceso a otras pantallas mientras el cambio inicial siga pendiente.
