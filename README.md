# Sistema de Autogestion Club Universal

## Vision, alcance, requerimientos, endpoints y product backlog

**Version simplificada - Club Universal de La Plata**

| Documento | Alcance, vision y backlog del producto |
| --- | --- |
| Fecha | 04/08/2026 |
| Base de revision | Documentacion existente + codigo actual del proyecto |
| Estado | Primera version comercial simplificada |

## Resumen Ejecutivo

El sistema busca centralizar las operaciones principales del Club Universal: pago y control de cuotas, inscripcion de socios a actividades deportivas y venta de entradas para eventos.

Esta version deja fuera del MVP los modulos de clases, profesores, reservas y canchas, para concentrar el producto en los flujos que generan mas valor inmediato para socios y administrativos.

La solucion apunta a reducir gestion presencial, ordenar la informacion del club y ofrecer una experiencia web simple para socios, administrativos y administradores.

## Vision Del Producto

Universal es una aplicacion web de autogestion para clubes deportivos. Permite que el socio consulte su situacion, pague cuotas mediante carga de comprobantes, se inscriba a actividades y compre entradas para eventos.

Del lado administrativo, permite gestionar socios, actividades, cuotas, comprobantes, eventos y ventas.

### Propuesta de Valor

- Centralizar en una sola herramienta los procesos mas importantes del club.
- Dar trazabilidad a cuotas, comprobantes, inscripciones y entradas.
- Reducir tareas manuales repetitivas y errores administrativos.
- Ofrecer al socio acceso remoto desde una interfaz web.
- Mantener una base funcional simple para validar con el cliente antes de ampliar el alcance.

### Usuarios Principales

| Actor | Responsabilidades y necesidades |
| --- | --- |
| Socio | Registrarse, iniciar sesion, actualizar datos, consultar cuotas, cargar comprobantes, inscribirse a actividades y comprar entradas. |
| Administrativo | Gestionar socios, actividades, cuotas en revision, comprobantes, eventos y ventas presenciales. |
| Administrador | Tiene control ampliado sobre usuarios, administrativos, generacion de cuotas, baja/eliminacion y configuracion operativa. |

## Alcance Del MVP Simplificado

### Dentro del Alcance

| Modulo | Alcance |
| --- | --- |
| Autenticacion y roles | Login, registro de socios, creacion protegida de administrativos y autorizacion por rol. |
| Socios | Consulta, actualizacion de datos, estado activo/inactivo y busqueda por DNI. |
| Actividades | Alta, baja logica o eliminacion, modificacion, consulta e inscripcion de socios. |
| Cuotas | Generacion mensual, control de estados, vencimientos, deuda, carga de comprobantes y aprobacion/rechazo administrativo. |
| Eventos | Gestion de eventos con fecha, horario, capacidad, precio, actividad asociada y ubicacion textual. |
| Entradas | Venta/compra de entradas, control por socio, cantidad, total, forma de pago y comprobante si corresponde. |

### Fuera del Alcance de Esta Version

- Clases semanales, cronogramas y horarios por actividad.
- Profesores, asignacion de profesores a actividades o seguimiento de clases.
- Canchas, reservas de canchas, disponibilidad horaria y senas de reserva.
- Integracion con medios de pago automaticos como Mercado Pago o tarjetas.
- Tienda de indumentaria institucional.
- Sistema avanzado de notificaciones por email o mensajeria; queda como mejora posterior.
- Suite completa de tests automatizados; queda planificada para una etapa posterior.

### Modelo de Dominio Actual

El schema de Prisma mantiene las entidades `Usuario`, `Socio`, `Administrativo`, `Actividad`, `ActividadSocio`, `Cuota`, `Comprobante`, `cuotaXactividad`, `Evento` y `Entrada`.

Fueron removidas del modelo las entidades `Profesor`, `Clase`, `Cancha` y `Reserva`, junto con los enums asociados a dias de clase o estados de reserva.