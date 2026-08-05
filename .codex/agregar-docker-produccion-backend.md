# Agregar Docker produccion backend

- Fecha: 2026-08-04
- Titulo del PR: Agregar Docker produccion backend
- Descripcion de los cambios: Se agrego una configuracion Docker de produccion para el backend y se preparo el Dockerfile principal para deploy productivo en Render.
- Documentos relacionados: AGENTS.md
- Autor: Codex

## Explicacion profunda de los cambios

Se agrego `backend/Dockerfile.prod` para construir una imagen de backend preparada para deploy: instala dependencias, genera Prisma Client, compila TypeScript y arranca la API con `npm start` luego de ejecutar `prisma migrate deploy`. Tambien se actualizo `backend/Dockerfile` con el mismo flujo productivo para que Render pueda usar el path `Dockerfile` sin depender de configuracion adicional.

Tambien se agrego `backend/.dockerignore` para evitar copiar dependencias locales, builds, logs, uploads y archivos `.env` dentro de la imagen. A nivel raiz se agrego `docker-compose.backend.yml` para probar localmente la imagen de produccion del backend usando las variables de `backend/.env`.

Finalmente, se actualizo `backend/.env.example` para documentar las variables requeridas por el backend en produccion, incluyendo `SUPABASE_URL` y `SUPABASE_SERVICE_KEY`.

Se agregaron endpoints publicos `/` y `/health` para evitar el `Cannot GET /` en la raiz del backend y permitir health checks basicos. El plan Free de Render puede seguir teniendo cold starts por inactividad; eso no se elimina desde el codigo, pero con `/health` el servicio queda listo para monitoreo o para migrar a un plan sin sleep.
