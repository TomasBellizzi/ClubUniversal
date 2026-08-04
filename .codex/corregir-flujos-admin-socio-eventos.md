# Corregir flujos admin socio eventos

- Fecha: 2026-08-04
- Titulo del PR: Corregir flujos admin socio eventos
- Descripcion de los cambios: Se corrigieron permisos y navegacion por rol, se agrego edicion de administrativos para ADMIN, se ajusto la visibilidad de eventos para socios y se corrigieron textos de ubicacion.
- Documentos relacionados: `frontend/src/App.jsx`, `frontend/src/components/Header.jsx`, `frontend/src/contexts/AuthContext.jsx`, `frontend/src/pages/ListAdministrativos.jsx`, `frontend/src/pages/CuotasAdminPage.jsx`, `frontend/src/pages/SocioEntradas.jsx`, `frontend/src/pages/AdminEventos.jsx`, `frontend/src/validations/eventosSchema.js`
- Autor: Codex

## Explicacion profunda de los cambios

Se protegio la ruta `/inicio` para que solo puedan verla `ADMIN` y `ADMINISTRATIVO`. Antes era publica, por lo que un usuario `SOCIO` podia quedar viendo el home administrativo si navegaba o quedaba redirigido a esa ruta.

Se ajusto `AuthContext` para combinar los datos del JWT con el usuario guardado en `localStorage`, priorizando el rol normalizado. Esto evita inconsistencias entre `role` y `rol` y ayuda a que el header muestre el menu correcto al cambiar de usuario.

Se actualizo `Header` para tomar el rol desde el contexto de autenticacion y limpiar sesion con el helper centralizado. Tambien se corrigio el redirect del cliente Axios ante `401` para volver a `/`, que es la ruta real del login.

En cuotas, el boton "Generar cuotas" quedo visible solo para `ADMIN`, porque la ruta `/generar-cuota` esta protegida solo para superAdmin. Antes tambien se mostraba a `ADMINISTRATIVO`, y al hacer click el guard lo devolvia al home.

Luego se reforzo la deteccion del rol `ADMIN` usando tambien el rol persistido en `localStorage`, tanto en `CuotasAdminPage`, `PrivateRoute` y `Header`. Esto evita que el boton desaparezca o que `/generar-cuota` rebote al home cuando el contexto de autenticacion todavia no esta sincronizado con el usuario guardado despues del login.

En el listado de administrativos se agrego un modal de edicion para que el `ADMIN` pueda modificar nombre, apellido, DNI, email y opcionalmente la contrasena de un administrativo existente usando `PUT /api/users/:id`.

En eventos para socios se hizo mas robusto el calculo de eventos disponibles: si `entradasVendidas` no viene en la respuesta, se toma como `0` para que un evento nuevo con cupo disponible aparezca en "Proximos Eventos". Tambien se ajusto la comparacion de fechas para usar solo la parte `YYYY-MM-DD`, evitando que un evento de hoy quede oculto por conversiones de zona horaria.

Finalmente se corrigieron textos visibles y validaciones relacionadas con "Ubicacion" para evitar mojibake en la pantalla de alta/edicion de eventos.
