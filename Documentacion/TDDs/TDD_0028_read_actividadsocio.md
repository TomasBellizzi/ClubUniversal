| Campo | Valor |
|---|---|
| ID | 0028 |
| Estado | Propuesto |
| Fecha | 2026-08-04 |
| Titulo | Consulta de Inscripciones |
| Clase | `ActividadSocio` |
| Operacion CRUD | `Read` |
| Ruta principal | `GET /api/actividadSocio, GET /api/actividadSocio/:id, GET /api/actividadSocio/actividad/:actividadId, GET /api/actividadSocio/socio/:socioId` |

---

# TDD-0028: Consulta de Inscripciones

---

## Contexto

### Objetivo
Consultar inscripciones generales, por actividad o por socio.

### User Persona
- **Nombre**: Usuario del Club Universal con rol `Autenticado`
- **Necesidad**: Necesita ejecutar la operacion `Read` sobre `ActividadSocio` de forma clara, segura y trazable dentro del sistema simplificado del club.

### Criterios de Aceptacion
- debe permitir consultar por actividad.
- debe permitir consultar por socio.
- detalle por id debe existir.

## Diseno Tecnico

### Modelo de Datos
Se utilizan los modelos existentes de Prisma:

```prisma
model ActividadSocio {
  id           Int       @id @default(autoincrement())
  actividadId  Int
  socioId      Int
  actividad    Actividad @relation(fields: [actividadId], references: [id])
  Socio        Socio     @relation(fields: [socioId], references: [id])

  @@unique([actividadId, socioId])
}
```

### Contrato de API

- **Ruta principal**: `GET /api/actividadSocio, GET /api/actividadSocio/:id, GET /api/actividadSocio/actividad/:actividadId, GET /api/actividadSocio/socio/:socioId`
- **Autenticacion requerida**: Si.
- **Roles permitidos**: Autenticado.

### Request Body
```ts
// Sin body.
// Params opcionales: id, actividadId, socioId.
```

### Response Body
```ts
{
  inscripciones: ActividadSocio[]
}

// o
{
  actividadSocio: ActividadSocio
}
```

### Componentes Tecnicos

- **Route**
  - Registra la ruta principal `GET /api/actividadSocio, GET /api/actividadSocio/:id, GET /api/actividadSocio/actividad/:actividadId, GET /api/actividadSocio/socio/:socioId`.
  - Aplica autenticacion y autorizacion segun el rol requerido.

- **Validation**
  - Valida parametros, body y archivos cuando corresponde.
  - Debe devolver errores claros para datos invalidos.

- **Controller**
  - Recibe el request HTTP.
  - Delega la logica en el servicio correspondiente.
  - Devuelve status code y respuesta JSON consistente.

- **Service**
  - Ejecuta reglas de negocio de la operacion `Read` sobre `ActividadSocio`.
  - Usa Prisma Client para persistencia y consultas.
  - Debe manejar errores de dominio y base de datos de forma controlada.

- **Persistencia**
  - Usa el modelo Prisma `ActividadSocio` o los modelos relacionados indicados en el diseno.

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Codigo HTTP |
|---|---|---|
| sin token | La API debe rechazar la operacion con un error claro y consistente | 401 |
| id inexistente | La API debe rechazar la operacion con un error claro y consistente | 404 |
| parametro invalido | La API debe rechazar la operacion con un error claro y consistente | 400 recomendado |

## Plan de Implementacion

1. Revisar la ruta `GET /api/actividadSocio, GET /api/actividadSocio/:id, GET /api/actividadSocio/actividad/:actividadId, GET /api/actividadSocio/socio/:socioId` y confirmar middlewares de autenticacion/autorizacion.
2. Validar el contrato de entrada de la operacion `Read`.
3. Implementar o ajustar el controlador de `ActividadSocio` para respuestas consistentes.
4. Implementar o ajustar el servicio de `ActividadSocio` con reglas de negocio y errores controlados.
5. Confirmar que Prisma respete relaciones, restricciones unicas e integridad referencial.
6. Agregar tests unitarios del servicio para escenario exitoso y errores de negocio.
7. Agregar tests de integracion para `GET /api/actividadSocio, GET /api/actividadSocio/:id, GET /api/actividadSocio/actividad/:actividadId, GET /api/actividadSocio/socio/:socioId` cubriendo 2xx, 4xx y permisos.
8. Documentar ejemplos de request/response en la coleccion de pruebas o README tecnico.
