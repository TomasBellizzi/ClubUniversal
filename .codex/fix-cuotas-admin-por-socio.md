# Fix cuotas admin por socio

- Fecha: 2026-08-13
- Titulo del PR: Fix cuotas admin por socio
- Descripcion de los cambios: Se corrigio el acceso desde la lista de socios para ver directamente las cuotas del socio seleccionado en el panel administrativo.
- Documentos relacionados: `frontend/src/pages/ListSocios.jsx`, `frontend/src/pages/CuotasAdminPage.jsx`, `backend/src/services/cuotaService.ts`, `backend/src/types/cuota.ts`
- Autor: Codex

## Explicacion profunda de los cambios

La pantalla administrativa de cuotas fue redisenada para abrir primero un listado por actividad. Ese comportamiento es correcto cuando el usuario entra desde el modulo de cuotas, pero no cuando viene desde `Gestion de Socios` y presiona `Ver Cuotas` sobre un socio puntual.

Se modifico `ListSocios` para navegar a `cuotas-admin` enviando `socioId`, nombre y DNI del socio. `CuotasAdminPage` ahora detecta ese estado inicial y, en ese caso, omite el listado por actividad y carga directamente el detalle de cuotas del socio seleccionado.

En backend, el endpoint administrativo de cuotas acepta el filtro `socioId` y lo aplica sobre `Cuota.socio_id`, reutilizando la misma respuesta que ya usa el detalle por actividad. El boton `Volver` desde este modo retorna a la pantalla de socios.
