# Corregir produccion responsive health

- Fecha: 2026-08-04
- Titulo del PR: Corregir produccion responsive health
- Descripcion de los cambios: Se corrigio el overflow horizontal del login mobile, se agregaron endpoints de salud del backend y se dejo Docker listo para produccion.
- Documentos relacionados: AGENTS.md
- Autor: Codex

## Explicacion profunda de los cambios

La pantalla publica de login tenia overflow horizontal en mobile por el header inicial con texto largo y por el layout del formulario. Se ajustaron clases especificas del header y del login para permitir salto de linea, limitar ancho y evitar scroll horizontal.

El backend ahora responde en `/` con informacion basica del servicio y en `/health` con estado, uptime y timestamp. Esto permite configurar health checks en Render y evita que la raiz del backend muestre `Cannot GET /`.

Tambien se actualizo `backend/Dockerfile` para que el deploy que apunta a `Dockerfile` ejecute una imagen productiva: instala dependencias con `npm ci`, genera Prisma Client, compila TypeScript y arranca con `npm start`.

Las migraciones Prisma quedan fuera del arranque automatico del contenedor. Si cambia el schema, se deben ejecutar como paso separado con una connection string directa compatible con Prisma Migrate.
