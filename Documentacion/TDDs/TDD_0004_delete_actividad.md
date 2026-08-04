| Campo | Valor |
|---|---|
| ID | 0004 |
| Estado | Propuesto |
| Fecha | 2026-08-04 |
| Titulo | Baja de Actividad |
| Clase | `Actividad` |
| Operacion CRUD | `Delete` |
| Ruta principal | `DELETE /api/actividades/:id` |

---

# TDD-0004: Baja de Actividad

---

## Contexto

### Objetivo
Eliminar una actividad y sus relaciones dependientes de forma atomica.

### User Persona
- **Nombre**: Usuario del Club Universal con rol `ADMIN / ADMINISTRATIVO`
- **Necesidad**: Necesita ejecutar la operacion `Delete` sobre `Actividad` de forma clara, segura y trazable dentro del sistema simplificado del club.

### Criterios de Aceptacion
- debe borrar entradas de eventos asociados.
- debe borrar eventos asociados.
- debe borrar inscripciones y cuotaXactividad.
- debe borrar la actividad en una transaccion.

## Diseno Tecnico

### Modelo de Datos
Se utilizan los modelos existentes de Prisma:

```prisma
model Actividad {
  id              Int               @id @default(autoincrement())
  nombre          String
  monto           Float
  activo          Boolean           @default(true)
  createdAt       DateTime          @default(now())
  cuotaXactividad cuotaXactividad[]
  socios          ActividadSocio[]
  eventos         Evento[]
}
```

### Contrato de API

- **Ruta principal**: `DELETE /api/actividades/:id`
- **Autenticacion requerida**: Si.
- **Roles permitidos**: ADMIN / ADMINISTRATIVO.

### Request Body
```ts
// Sin body.
// Param: id numerico de actividad.
```

### Response Body
```ts
{
  message: "Actividad eliminada correctamente"
}
```

### Componentes Tecnicos

- **Route**
  - Registra la ruta principal `DELETE /api/actividades/:id`.
  - Aplica autenticacion y autorizacion segun el rol requerido.

- **Validation**
  - Valida parametros, body y archivos cuando corresponde.
  - Debe devolver errores claros para datos invalidos.

- **Controller**
  - Recibe el request HTTP.
  - Delega la logica en el servicio correspondiente.
  - Devuelve status code y respuesta JSON consistente.

- **Service**
  - Ejecuta reglas de negocio de la operacion `Delete` sobre `Actividad`.
  - Usa Prisma Client para persistencia y consultas.
  - Debe manejar errores de dominio y base de datos de forma controlada.

- **Persistencia**
  - Usa el modelo Prisma `Actividad` o los modelos relacionados indicados en el diseno.

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Codigo HTTP |
|---|---|---|
| id inexistente | 404/500 controlado | |
| actividad con eventos | elimina dependencias | |
| sin token | La API debe rechazar la operacion con un error claro y consistente | 401 |
| rol SOCIO | La API debe rechazar la operacion con un error claro y consistente | 403 |

## Plan de Implementacion

1. Revisar la ruta `DELETE /api/actividades/:id` y confirmar middlewares de autenticacion/autorizacion.
2. Validar el contrato de entrada de la operacion `Delete`.
3. Implementar o ajustar el controlador de `Actividad` para respuestas consistentes.
4. Implementar o ajustar el servicio de `Actividad` con reglas de negocio y errores controlados.
5. Confirmar que Prisma respete relaciones, restricciones unicas e integridad referencial.
6. Agregar tests unitarios del servicio para escenario exitoso y errores de negocio.
7. Agregar tests de integracion para `DELETE /api/actividades/:id` cubriendo 2xx, 4xx y permisos.
8. Documentar ejemplos de request/response en la coleccion de pruebas o README tecnico.
