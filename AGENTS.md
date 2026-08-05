# AGENTS.md

## Proyecto

Sistema web de autogestion para el Club Universal de La Plata.

El objetivo actual del producto es una primera version simplificada y vendible, enfocada en:

- Pago y gestion de cuotas de socios.
- Inscripcion de socios a actividades deportivas.
- Gestion de eventos y venta/compra de entradas.
- Administracion de socios, usuarios y administrativos.

El repositorio activo es:

- Ruta local: `C:\Users\tomyb\OneDrive\Documentos\Facultad\ClubUniversal`
- Remoto: `https://github.com/TomasBellizzi/ClubUniversal.git`
- Rama principal: `main`

No usar como fuente de trabajo la carpeta vieja `C:\Users\tomyb\OneDrive\Documentos\Facultad\Universal\UTN-DS25-Grupo3`, salvo para recuperar algun artefacto historico.

## Arquitectura

El proyecto esta dividido en:

- `backend/`: API Express + TypeScript + Prisma.
- `frontend/`: React + Vite.
- `Documentacion/`: documentacion funcional, alcance, TDDs y material de fases.
- `.github/`: configuracion de PRs, CI, CodeQL y Dependabot.

Backend:

- Runtime: Node.js.
- Framework HTTP: Express.
- Lenguaje: TypeScript.
- ORM: Prisma.
- Base de datos: PostgreSQL en Supabase.
- Autenticacion: JWT.
- Validaciones: Zod.
- Uploads: Multer.

Frontend:

- React + Vite.
- Axios para llamadas HTTP.
- Variable requerida para desarrollo local: `frontend/.env` con `VITE_API_URL=http://localhost:3000`.

## Modelo de Dominio Actual

Modelos Prisma mantenidos:

- `Usuario`: credenciales, email, password, rol.
- `Socio`: perfil de socio, DNI, estado, datos personales.
- `Administrativo`: perfil administrativo vinculado a un usuario.
- `Actividad`: actividad deportiva ofrecida por el club.
- `ActividadSocio`: inscripcion de socio a actividad.
- `Cuota`: cuotas generadas para socios.
- `Comprobante`: comprobantes cargados para cuotas.
- `cuotaXactividad`: relacion auxiliar entre cuotas y actividades.
- `Evento`: eventos del club asociados a actividades.
- `Entrada`: entradas vendidas/compradas para eventos.

Modelos/modulos removidos del alcance actual:

- `Clase`
- `Profesor`
- `Cancha`
- `Reserva`
- Rutas, controladores, servicios, validaciones y paginas frontend asociadas a esos modulos.

Decision importante: se removieron clases aunque en una version futura podrian volver si el cliente confirma que necesita cronogramas de actividades. Por ahora el MVP conserva inscripcion directa a `Actividad`.

## Roles

- `SOCIO`: puede operar sobre su perfil, cuotas, comprobantes, actividades y entradas propias.
- `ADMINISTRATIVO`: puede gestionar socios, actividades, eventos, entradas y cuotas en revision.
- `ADMIN`: permisos ampliados, incluyendo creacion de administrativos, generacion/eliminacion de cuotas y operaciones sensibles.

`Usuario` representa la cuenta de acceso. `Socio` y `Administrativo` representan perfiles de dominio vinculados a `Usuario`.

## Endpoints Principales

Montaje en `backend/src/app.ts`:

- `/api/auth`
- `/api/users`
- `/api/socios`
- `/api/actividades`
- `/api/actividadSocio`
- `/api/cuotas`
- `/api/eventos`
- `/api/entradas`

Operaciones destacadas:

- Auth:
  - `POST /api/auth/login`
  - `POST /api/auth/register`
  - `POST /api/auth/register/administrativo`
- Actividades:
  - `GET /api/actividades`
  - `GET /api/actividades/:id`
  - `POST /api/actividades`
  - `PUT /api/actividades/:id`
  - `DELETE /api/actividades/:id`
- Inscripciones:
  - `GET /api/actividadSocio`
  - `GET /api/actividadSocio/:id`
  - `GET /api/actividadSocio/actividad/:actividadId`
  - `GET /api/actividadSocio/socio/:socioId`
  - `POST /api/actividadSocio`
  - `PUT /api/actividadSocio/:id`
  - `DELETE /api/actividadSocio/:id`
- Cuotas:
  - `GET /api/cuotas/socio`
  - `POST /api/cuotas/socio/:cuotaId/comprobante`
  - `GET /api/cuotas/administrativo`
  - `PATCH /api/cuotas/administrativo/:id/estado`
  - `GET /api/cuotas/admin`
  - `POST /api/cuotas/admin/generar`
  - `POST /api/cuotas/admin/vencimiento`
  - `DELETE /api/cuotas/admin/:id`
- Comprobantes:
  - `GET /api/cuotas/:id`
  - `PATCH /api/cuotas/:id/estado`
- Eventos:
  - `GET /api/eventos`
  - `GET /api/eventos/:id`
  - `POST /api/eventos`
  - `PUT /api/eventos/:id`
  - `POST /api/eventos/:id/venta`
  - `DELETE /api/eventos/:id`
- Entradas:
  - `GET /api/entradas`
  - `GET /api/entradas/:id`
  - `POST /api/entradas`
  - `PUT /api/entradas/:id`

## Decisiones Tomadas

- Se simplifico el alcance para evitar vender una version demasiado amplia e inestable.
- Se eliminaron clases, profesores, reservas y canchas.
- `Evento` usa `ubicacion` textual en lugar de relacion con cancha.
- Rutas sensibles se protegieron con `authenticate` y `authorize`.
- El registro publico permite solo rol `SOCIO`.
- La creacion de administrativos se movio a endpoint protegido para `ADMIN`.
- Se removio el fallback inseguro de `JWT_SECRET`.
- El middleware de errores no debe exponer stack traces ni headers sensibles al cliente.
- Se agrego CI con GitHub Actions.
- Se agrego CodeQL.
- Se agrego Dependabot, pero hay que manejar sus PRs con cuidado para no aceptar majors a ciegas.
- Se agrego template de PR.
- Se configuro branch protection para que `main` sea estable mediante PRs y checks.

## Tareas Terminadas

- Limpieza de alcance del backend y frontend.
- Migracion Prisma de simplificacion:
  - `backend/prisma/migrations/20260801130000_simplificar_modulos_core/migration.sql`
- Validacion de schema Prisma contra Supabase.
- Creacion de usuario admin de prueba:
  - Email: `administrador1@admin.com`
  - Password: `administrador123`
- Generacion de PDF de alcance/vision/endpoints/backlog.
- Generacion de 30 TDDs en:
  - `Documentacion/TDDs/`
- Configuracion de:
  - `.github/pull_request_template.md`
  - `.github/workflows/ci.yml`
  - `.github/workflows/codeql.yml`
  - `.github/dependabot.yml`
- Correccion del CI backend con variables dummy para `prisma validate`.

## Tarea Actual

Planificar e implementar estrategia de testing.

Objetivo acordado:

- Aproximadamente 90 a 95 tests unitarios totales.
- Aproximadamente 60 tests de integracion.
- Aproximadamente 10 a 12 tests E2E.

La estrategia debe apoyarse en:

- TDDs existentes en `Documentacion/TDDs/`.
- Flujos criticos del MVP:
  - Registro y login.
  - Alta/listado/edicion/baja de actividades.
  - Inscripcion de socio a actividad.
  - Generacion de cuotas.
  - Carga de comprobante.
  - Aprobacion/rechazo de cuota.
  - Alta de evento.
  - Compra/venta de entradas.
  - Validacion de permisos por rol.

El usuario menciono que tiene archivos de teoria y ejemplos de tests. Antes de implementar tests, leer esos archivos para alinear formato, herramientas y expectativas academicas.

## Problemas Conocidos

- El README todavia conserva texto viejo con menciones a profesores y alcance amplio.
- Hay warnings de ESLint en frontend por dependencias faltantes en `useEffect`.
- `frontend/.env` no esta versionado y debe existir localmente con:
  - `VITE_API_URL=http://localhost:3000`
- Dependabot puede abrir muchos PRs. No mergear majors automaticamente.
- El frontend build avisa que el bundle principal supera 500 KB. No bloquea, pero queda como mejora futura.
- Prisma muestra warning de deprecacion por configuracion `package.json#prisma`; antes de Prisma 7 conviene migrar a `prisma.config.ts`.
- No hay suite de tests implementada todavia.
- Algunas respuestas HTTP y errores pueden no estar totalmente normalizados.
- Revisar ownership: un socio no debe acceder a cuotas, comprobantes o entradas ajenas.

## Deploy y Entornos

El sistema esta desplegado de forma continua:

- Frontend: Vercel.
- Backend: Render.
- Backend productivo: Docker, usando `backend/Dockerfile` / `backend/Dockerfile.prod`.

Notas:

- `docker-compose.backend.yml` permite probar localmente la imagen productiva del backend.
- Render usa health checks contra endpoints publicos `/` y `/health`.
- Las migraciones Prisma no deben ejecutarse automaticamente en el `CMD` del contenedor. Cuando cambia el schema, correr `prisma migrate deploy` como paso separado con una connection string apta para migraciones.
- Para Mercado Pago en deploy, configurar variables en Render:
  - `MERCADOPAGO_ACCESS_TOKEN`
  - `BACKEND_PUBLIC_URL`
  - `FRONTEND_URL`
- Para frontend en Vercel, configurar:
  - `VITE_API_URL`

## Comandos Utiles

Desde la raiz del repo:

```bash
git status
git branch --show-current
git remote -v
```

Backend:

```bash
cd backend
npm install
npm run dev
npm run build
npx prisma validate
npx prisma migrate status
```

Frontend:

```bash
cd frontend
npm install
npm run dev
npm run build
npm run lint
```

Levantar app local:

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

URLs locales habituales:

- Backend: `http://localhost:3000`
- Frontend Vite: `http://localhost:5173`

CI local aproximado:

```bash
cd backend
npx prisma validate
npm run build

cd ../frontend
npm run lint
npm run build
```

## Git y Workflow

Workflow deseado:

1. Crear rama desde `main`.
2. Hacer cambios.
3. Commit con mensaje descriptivo.
4. Push de la rama.
5. Abrir PR contra `main`.
6. Esperar CI, frontend checks y CodeQL.
7. Mergear solo si checks estan verdes.

Ejemplo:

```bash
git checkout main
git pull origin main
git checkout -b feature/nombre-claro
git add .
git commit -m "Descripcion breve"
git push origin feature/nombre-claro
```

PR template esperado:

- Descripcion.
- Documentos Relacionados.
- Checklist de Estandares.

## Registro de Cambios para Agentes

Cuando se haga un cambio en el repositorio, ya sea agregar, modificar o quitar archivos, se debe crear un archivo de contexto dentro de `.codex/`.

El archivo debe nombrarse con el titulo o nombre del PR asociado al cambio, usando un nombre claro y compatible con filesystem, por ejemplo:

- `.codex/feature-estrategia-testing.md`
- `.codex/fix-validacion-cuotas.md`

Cada archivo debe seguir este formato:

```markdown
# Titulo del PR

- Fecha:
- Titulo del PR:
- Descripcion de los cambios:
- Documentos relacionados:
- Autor:

## Explicacion profunda de los cambios

...
```

Objetivo: dejar contexto breve pero util para que otros agentes entiendan que se cambio, por que se cambio y que documentos o TDDs se relacionan con el trabajo.

## Proximos Pasos Recomendados

1. Leer archivos de teoria y ejemplos de tests que aporte el usuario.
2. Definir estructura de carpetas de tests para backend y frontend.
3. Definir herramientas:
   - Backend unit/integration: Jest + Supertest.
   - Frontend component/unit: probablemente Vitest + Testing Library o Jest si se prefiere uniformidad.
   - E2E: Playwright recomendado.
4. Crear matriz de tests por modulo antes de codificar.
5. Implementar primero tests de backend de integracion para flujos criticos.
6. Agregar scripts de test al CI.
7. Luego incorporar E2E progresivamente.
8. Corregir warnings de hooks en frontend.
9. Actualizar README para reflejar el alcance simplificado.
10. Revisar Dependabot para agrupar updates y limitar majors.

## Notas Para Agentes

- No tocar secretos ni subir `.env`.
- No trabajar sobre la carpeta vieja.
- No reintroducir clases, profesores, reservas ni canchas salvo pedido explicito.
- Mantener documentos y codigo alineados con el alcance simplificado.
- Si se modifica la API, actualizar TDDs relacionados.
- Si se agregan tests, integrarlos al CI de forma incremental.
- Antes de finalizar cambios de codigo, correr build/lint/test correspondiente.
