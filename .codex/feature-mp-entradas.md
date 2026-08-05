# Feature MP entradas

- Fecha: 2026-08-05
- Titulo del PR: Feature MP entradas
- Descripcion de los cambios: Se reemplaza el flujo online de compra de entradas del socio basado en comprobante por una integracion inicial con Mercado Pago Checkout Pro en modo prueba.
- Documentos relacionados: `Alcance.pdf`, `Documentacion/TDDs/TDD_0017_create_entrada.md`, `frontend/src/pages/SocioEntradas.jsx`, `backend/src/services/mercadoPago.service.ts`
- Autor: Codex

## Explicacion profunda de los cambios

La compra online de entradas por parte del socio deja de pedir CBU y comprobante. En su lugar, el frontend solicita al backend la creacion de una preferencia de Mercado Pago para el evento y cantidad seleccionados. El backend crea una entrada en estado `PENDIENTE`, calcula el total como `precioEntrada * cantidad`, crea la preferencia en Mercado Pago y devuelve la URL de pago.

El socio es redirigido a Mercado Pago. Cuando vuelve al sistema, el backend procesa el retorno, marca la entrada como `PAGADA`, `PENDIENTE` o `CANCELADA` segun el estado recibido y redirige nuevamente a `/entradasSocio`.

La pantalla de entradas del socio detecta el retorno exitoso, refresca sus entradas y envia un mail con los datos principales usando el servicio de email existente. Para evitar emails duplicados por refresco de pagina, guarda una marca local por entrada.

La pantalla administrativa de entradas presenciales no se toca. Ese flujo sigue usando `POST /api/entradas` para registrar ventas hechas fuera de Mercado Pago.

Se agregan campos en Prisma para registrar estado de entrada y datos de Mercado Pago: preference id, payment id, status y external reference. Tambien se agrega `MERCADOPAGO` a `FormaDePago`.

Para desarrollo y prueba se requiere `MERCADOPAGO_ACCESS_TOKEN` con credenciales de prueba de Mercado Pago Developers. Si se prueba retorno/webhook desde Mercado Pago, `BACKEND_PUBLIC_URL` debe apuntar a una URL publica accesible por Mercado Pago, por ejemplo un deploy o un tunel tipo ngrok. `FRONTEND_URL` debe apuntar al frontend.

El proyecto esta desplegado continuamente con frontend en Vercel y backend en Render usando Docker. Para probar Mercado Pago en el entorno desplegado, Render debe tener `MERCADOPAGO_ACCESS_TOKEN`, `BACKEND_PUBLIC_URL` con la URL publica del backend y `FRONTEND_URL` con la URL de Vercel. Vercel debe tener `VITE_API_URL` apuntando al backend de Render.

## Ajustes posteriores durante la prueba local

Durante las pruebas reales del flujo de compra se detectaron varios puntos que fueron corregidos para dejar el comportamiento alineado con la vision del producto:

- Se elimino del modal de compra del socio toda referencia a CBU, transferencia y adjuntar comprobante.
- El boton principal del modal paso a comunicar el flujo real de pago con Mercado Pago.
- Las entradas creadas por intentos de Mercado Pago quedan inicialmente como `PENDIENTE`, pero no se muestran al socio como entradas validas ni descuentan disponibilidad del evento.
- Las entradas `PAGADA` son las unicas consideradas como vendidas para disponibilidad, listados del socio y conteos administrativos.
- Se agrego un flujo de conciliacion desde el frontend para cubrir el caso local donde Mercado Pago no puede llamar a un webhook en `localhost`.
- Se agrego un endpoint autenticado para que el socio pueda conciliar una entrada pendiente contra Mercado Pago si vuelve manualmente a `/entradasSocio`.
- El webhook queda implementado para entornos publicos, como Render, donde Mercado Pago si puede llamar al backend.
- Se ajusto el retorno de Mercado Pago para que redirija correctamente al frontend y no deje al usuario en una ruta de API.

## Detalle del flujo actual de Mercado Pago

1. El socio abre `Mis Entradas` y elige comprar una entrada de un evento.
2. El frontend pide al backend crear una preferencia de Mercado Pago.
3. El backend crea una `Entrada` en estado `PENDIENTE`, con `formaDePago = MERCADOPAGO` y una `external_reference`.
4. El backend crea la preferencia en Mercado Pago y devuelve la URL de checkout.
5. El frontend guarda temporalmente la entrada pendiente en `localStorage` y redirige a Mercado Pago.
6. Si el pago se aprueba, Mercado Pago puede notificar por webhook o el usuario puede volver al sistema.
7. Al volver a `/entradasSocio`, el frontend intenta conciliar la entrada pendiente.
8. Si Mercado Pago informa `approved`, la entrada pasa a `PAGADA`.
9. La entrada ya aparece como activa/pagada y se envia el mail al socio.

## Decisiones tomadas

- No se usa `PUBLIC_KEY` de Mercado Pago porque la integracion implementada es Checkout Pro por redireccion. El frontend no tokeniza tarjetas ni renderiza Brick/API de pagos, por lo tanto solo necesita la URL generada por el backend.
- No se debe usar el access token de una cuenta personal ni de comprador. El `MERCADOPAGO_ACCESS_TOKEN` debe ser del vendedor de prueba, porque representa la cuenta que cobra.
- Para pagar se usa una cuenta de comprador de prueba distinta a la cuenta vendedora.
- En local, `BACKEND_PUBLIC_URL=http://localhost:3000` sirve para crear preferencias, pero Mercado Pago no puede invocar webhooks contra `localhost`.
- En deploy, `BACKEND_PUBLIC_URL` debe ser la URL publica de Render y `FRONTEND_URL` la URL publica de Vercel.
- Se mantiene la carga manual/presencial desde la pantalla del administrador. Ese flujo representa ventas en efectivo o presenciales y no debe pasar por Mercado Pago.

## Problemas encontrados en pruebas

- Algunas tarjetas guardadas en cuentas sandbox fallaron dentro del checkout de Mercado Pago, aunque la preferencia se creaba correctamente.
- El pago con dinero disponible en la cuenta de comprador de prueba funciono correctamente.
- En una prueba aprobada, Mercado Pago genero un pago `approved` con metodo `account_money`.
- Como la prueba fue local, el retorno/webhook no completo automaticamente el estado dentro del sistema.
- Se verifico el pago aprobado contra la API de Mercado Pago y se actualizo la entrada correspondiente a `PAGADA`.
- A partir de eso se reforzo el flujo de conciliacion para evitar depender exclusivamente del webhook en pruebas locales.

## Ajustes de entorno y Docker

Se detecto un problema ajeno al login: el backend no podia llegar a Supabase desde Docker en un arranque posterior. La causa operativa fue una combinacion de:

- Un contenedor temporal del backend habia quedado ocupando el puerto `3000`.
- `app_backend` no estaba corriendo como contenedor principal.
- `docker-compose.yml` ejecutaba `npx prisma migrate deploy` antes de arrancar el backend, por lo que cualquier corte momentaneo del pooler de Supabase hacia fallar el inicio completo.
- El frontend del compose apuntaba a `frontend/.env`, archivo que ya no se usa.

Correcciones aplicadas:

- Se detuvo el contenedor temporal que ocupaba `3000`.
- Se cambio el backend del compose para arrancar con `npm run dev`.
- Se cambio el env del frontend en compose a `frontend/.env.development`.
- Se quito la dependencia obligatoria del backend hacia el Postgres local.
- El servicio `db` quedo bajo el perfil opcional `local-db`.
- Se elimino la clave `version` obsoleta del compose.

Con esto, el backend local queda pensado para conectarse a Supabase y no para levantar una base local por defecto.

## Variables necesarias

Backend local:

```env
BACKEND_PUBLIC_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
DATABASE_URL=<connection string de Supabase>
DIRECT_URL=<connection string directa/session pooler de Supabase>
MERCADOPAGO_ACCESS_TOKEN=<access token TEST del vendedor>
```

Frontend local:

```env
VITE_API_URL=http://localhost:3000
```

Render:

```env
BACKEND_PUBLIC_URL=https://<backend-render>.onrender.com
FRONTEND_URL=https://<frontend-vercel>.vercel.app
DATABASE_URL=<connection string de Supabase>
DIRECT_URL=<connection string directa/session pooler de Supabase>
MERCADOPAGO_ACCESS_TOKEN=<access token TEST o PROD segun entorno>
```

Vercel:

```env
VITE_API_URL=https://<backend-render>.onrender.com
```

## Verificaciones realizadas

- `app_backend` quedo corriendo en Docker y publicado en `localhost:3000`.
- `GET http://localhost:3000/health` respondio correctamente.
- Prisma pudo consultar Supabase desde el contenedor.
- `npm run build` del backend finalizo correctamente.
- `npm run build` del frontend finalizo correctamente.
- El warning de Vite por bundle grande sigue existiendo, pero no bloquea la build.

## Pendientes y observaciones

- Probar el flujo completo en deploy publico con Render/Vercel para validar webhook real, no solo conciliacion local.
- Revisar la pantalla administrativa de eventos para asegurar que el detalle de ventas muestre tanto ventas presenciales como ventas pagadas por Mercado Pago.
- Agregar tests unitarios e integracion para estados de entradas: `PENDIENTE`, `PAGADA`, `CANCELADA`.
- Agregar tests del servicio de Mercado Pago mockeando respuestas `approved`, `pending`, `rejected` y errores de API.
- Agregar un E2E del socio comprando entrada con conciliacion simulada.
