# Admin eventos: detalle desplegable y compradores

- Fecha: 2026-08-05
- Rama: `feature/mp`
- Area: administracion de eventos
- Archivos principales: `frontend/src/pages/AdminEventos.jsx`, `backend/src/services/evento.service.ts`, `backend/src/controllers/eventos.controller.ts`, `backend/src/types/evento.ts`
- Autor: Codex

## Resumen

Se reemplazo el detalle de evento en modal por una vista desplegable dentro de cada tarjeta de evento. El administrador ahora puede clickear el evento para ver sus datos y la lista de socios que compraron entradas.

## Cambios en frontend

En `AdminEventos.jsx`:

- Se elimino el boton azul de ver detalle.
- La tarjeta del evento ahora es clickeable.
- Al clickear un evento se abre/cierra una seccion desplegable.
- El evento desplegado ocupa todo el ancho disponible para mejorar la lectura.
- Los botones de editar, registrar venta y eliminar mantienen su comportamiento y no abren/cierra el desplegable accidentalmente.
- El detalle muestra fecha, horario, actividad, ubicacion, capacidad, vendidas, precio, total y descripcion.
- Se agrego una tabla de compradores con socio, DNI, email, cantidad y forma de pago.
- Se agrego buscador por DNI o email.
- La lista de compradores solo usa entradas con estado `PAGADA`.

## Cambios en backend

Se verifico y ajusto el backend para que los datos pedidos por la nueva vista esten disponibles:

- `GET /api/eventos` ya devuelve eventos con `entradas`, `socio`, `dni` y `email`.
- `entradasVendidas` y `montoTotal` se calculan solo con entradas `PAGADA`.
- Se centralizo el armado del evento en `mapEventoConVentas`.
- `GET /api/eventos/:id` quedo consistente con el listado y ya no devuelve una respuesta envuelta de mas.
- El tipo `Evento` ahora contempla `entradasVendidas` y `montoTotal`.

## Verificaciones realizadas

- `npm run build` del frontend finalizo correctamente.
- `npm run build` del backend finalizo correctamente.
- Se consulto `GET /api/eventos` con token de `ADMINISTRATIVO`.
- Se confirmo que el evento `Universal vs Atenas` devuelve `entradasVendidas: 2` y `montoTotal: 20000`.
- Se confirmo que las entradas pagadas traen compradores con DNI y email.
- Se confirmo que las entradas `PENDIENTE` de pruebas de Mercado Pago no cuentan como vendidas.
- Se reinicio el backend Docker para verificar `GET /api/eventos/1` con el controller corregido.

## Pendientes

- Revisar visualmente la tabla desplegable en mobile.
- Agregar tests de integracion para `GET /api/eventos` y `GET /api/eventos/:id`.
- Agregar test de frontend para el filtro de compradores por DNI y email.
