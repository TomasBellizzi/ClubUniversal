| Campo | Valor |
|---|---|
| ID | 0002 |
| Estado | Propuesto |
| Fecha | 2026-08-04 |
| Titulo | Consulta de Actividades |
| Clase | `Actividad` |
| Operacion CRUD | `Read` |
| Ruta principal | `GET /api/actividades y GET /api/actividades/:id` |

---

# TDD-0002: Consulta de Actividades

---

## Contexto

### Objetivo
Consultar el catalogo de actividades y el detalle de una actividad.

### User Persona
- **Nombre**: Usuario del Club Universal con rol `Autenticado`
- **Necesidad**: Necesita ejecutar la operacion `Read` sobre `Actividad` de forma clara, segura y trazable dentro del sistema simplificado del club.

### Criterios de Aceptacion
- debe listar ordenado por fecha de creacion descendente.
- debe devolver total.
- detalle por id debe existir.

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

- **Ruta principal**: `GET /api/actividades y GET /api/actividades/:id`
- **Autenticacion requerida**: Si.
- **Roles permitidos**: Autenticado.

### Request Body
```ts
// Sin body.
// Param opcional: id numerico en GET /api/actividades/:id
```

### Response Body
```ts
{
  actividades: Actividad[],
  total: number
}

// o
{
  actividad: Actividad,
  message: "Actividad retrieved successfully"
}
```

### Componentes Tecnicos

- **Route**
  - Registra la ruta principal `GET /api/actividades y GET /api/actividades/:id`.
  - Aplica autenticacion y autorizacion segun el rol requerido.

- **Validation**
  - Valida parametros, body y archivos cuando corresponde.
  - Debe devolver errores claros para datos invalidos.

- **Controller**
  - Recibe el request HTTP.
  - Delega la logica en el servicio correspondiente.
  - Devuelve status code y respuesta JSON consistente.

- **Service**
  - Ejecuta reglas de negocio de la operacion `Read` sobre `Actividad`.
  - Usa Prisma Client para persistencia y consultas.
  - Debe manejar errores de dominio y base de datos de forma controlada.

- **Persistencia**
  - Usa el modelo Prisma `Actividad` o los modelos relacionados indicados en el diseno.

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Codigo HTTP |
|---|---|---|
| sin token | La API debe rechazar la operacion con un error claro y consistente | 401 |
| id inexistente | 404/500 controlado | |
| id invalido | La API debe rechazar la operacion con un error claro y consistente | 400 recomendado |

## Plan de Implementacion

1. Revisar la ruta `GET /api/actividades y GET /api/actividades/:id` y confirmar middlewares de autenticacion/autorizacion.
2. Validar el contrato de entrada de la operacion `Read`.
3. Implementar o ajustar el controlador de `Actividad` para respuestas consistentes.
4. Implementar o ajustar el servicio de `Actividad` con reglas de negocio y errores controlados.
5. Confirmar que Prisma respete relaciones, restricciones unicas e integridad referencial.
6. Agregar tests unitarios del servicio para escenario exitoso y errores de negocio.
7. Agregar tests de integracion para `GET /api/actividades y GET /api/actividades/:id` cubriendo 2xx, 4xx y permisos.
8. Documentar ejemplos de request/response en la coleccion de pruebas o README tecnico.
