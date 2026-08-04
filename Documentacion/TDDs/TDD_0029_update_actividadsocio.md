| Campo | Valor |
|---|---|
| ID | 0029 |
| Estado | Propuesto |
| Fecha | 2026-08-04 |
| Titulo | Modificacion de Inscripcion |
| Clase | `ActividadSocio` |
| Operacion CRUD | `Update` |
| Ruta principal | `PUT /api/actividadSocio/:id` |

---

# TDD-0029: Modificacion de Inscripcion

---

## Contexto

### Objetivo
Modificar la relacion entre socio y actividad cuando sea necesario.

### User Persona
- **Nombre**: Usuario del Club Universal con rol `ADMIN`
- **Necesidad**: Necesita ejecutar la operacion `Update` sobre `ActividadSocio` de forma clara, segura y trazable dentro del sistema simplificado del club.

### Criterios de Aceptacion
- solo ADMIN.
- actividad y socio deben existir.
- no generar duplicados.

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

- **Ruta principal**: `PUT /api/actividadSocio/:id`
- **Autenticacion requerida**: Si.
- **Roles permitidos**: ADMIN.

### Request Body
```ts
{
  actividadId?: number;
  socioId?: number;
}
```

### Response Body
```ts
{
  actividadSocio: ActividadSocio,
  message: string
}
```

### Componentes Tecnicos

- **Route**
  - Registra la ruta principal `PUT /api/actividadSocio/:id`.
  - Aplica autenticacion y autorizacion segun el rol requerido.

- **Validation**
  - Valida parametros, body y archivos cuando corresponde.
  - Debe devolver errores claros para datos invalidos.

- **Controller**
  - Recibe el request HTTP.
  - Delega la logica en el servicio correspondiente.
  - Devuelve status code y respuesta JSON consistente.

- **Service**
  - Ejecuta reglas de negocio de la operacion `Update` sobre `ActividadSocio`.
  - Usa Prisma Client para persistencia y consultas.
  - Debe manejar errores de dominio y base de datos de forma controlada.

- **Persistencia**
  - Usa el modelo Prisma `ActividadSocio` o los modelos relacionados indicados en el diseno.

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Codigo HTTP |
|---|---|---|
| rol no ADMIN | La API debe rechazar la operacion con un error claro y consistente | 403 |
| id inexistente | La API debe rechazar la operacion con un error claro y consistente | 404 |
| duplicado | La API debe rechazar la operacion con un error claro y consistente | 409 |
| sin token | La API debe rechazar la operacion con un error claro y consistente | 401 |

## Plan de Implementacion

1. Revisar la ruta `PUT /api/actividadSocio/:id` y confirmar middlewares de autenticacion/autorizacion.
2. Validar el contrato de entrada de la operacion `Update`.
3. Implementar o ajustar el controlador de `ActividadSocio` para respuestas consistentes.
4. Implementar o ajustar el servicio de `ActividadSocio` con reglas de negocio y errores controlados.
5. Confirmar que Prisma respete relaciones, restricciones unicas e integridad referencial.
6. Agregar tests unitarios del servicio para escenario exitoso y errores de negocio.
7. Agregar tests de integracion para `PUT /api/actividadSocio/:id` cubriendo 2xx, 4xx y permisos.
8. Documentar ejemplos de request/response en la coleccion de pruebas o README tecnico.
