# Fix cuotas socios sin actividad

- Fecha: 2026-08-13
- Titulo del PR: Fix cuotas socios sin actividad
- Descripcion de los cambios: Se agrego un flujo explicito para generar cuotas a socios sin actividad, sin sumar monto extra por actividad, y se mejoro la previsualizacion de cuotas por actividad.
- Documentos relacionados: AGENTS.md, backend/src/services/cuotaService.ts, frontend/src/pages/CuotasAdminPage.jsx, frontend/src/pages/generarCuota.jsx
- Autor: Codex

## Explicacion profunda de los cambios

La pantalla de cuotas por actividad ahora mantiene acciones separadas: cada actividad permite generar cuotas para sus socios inscriptos, y existe una accion especifica para generar cuotas a socios activos que no estan inscriptos a ninguna actividad.

Cuando se genera una cuota desde una actividad, el formulario conserva la actividad de origen, muestra el monto extra configurado en esa actividad como dato no editable y calcula el total estimado como monto base mas extra de actividad. Cuando se genera una cuota para socios sin actividad, el formulario muestra el destino como "Socios sin actividad", mantiene el extra de actividad en cero y genera cuotas solo con el monto base cargado manualmente.

En backend se agrego el flag `soloSinActividad` al contrato de generacion de cuotas. Con ese flag activo, el servicio filtra socios activos sin inscripciones y no agrega detalles de actividad a la cuota. La previsualizacion tambien devuelve nombre y DNI del socio para poder mostrar correctamente el detalle sin depender de una carga previa por actividad. Tambien se corrigio la generacion para respetar la fecha de vencimiento elegida en el formulario, que antes se previsualizaba pero no se persistia en backend.
