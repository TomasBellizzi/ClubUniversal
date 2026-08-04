| Campo | Valor |
|---|---|
| ID | 0016 |
| Estado | Propuesto |
| Fecha | 2026-08-04 |
| Titulo | Baja de Evento |
| Clase | `Evento` |
| Operacion CRUD | `Delete` |
| Ruta principal | `DELETE /api/eventos/:id` |

---

# TDD-0016: Baja de Evento

---

## Contexto

### Objetivo
Eliminar un evento cuando corresponda.

### User Persona
- **Nombre**: Usuario del Club Universal con rol `ADMIN`
- **Necesidad**: Necesita ejecutar la operacion `Delete` sobre `Evento` de forma clara, segura y trazable dentro del sistema simplificado del club.

### Criterios de Aceptacion
- solo ADMIN.
- debe considerar entradas asociadas.
- debe evitar inconsistencias.

## Diseno Tecnico

### Modelo de Datos
Se utilizan los modelos existentes de Prisma:

```prisma
model Evento {
  id            Int       @id @default(autoincrement())
  nombre        String
  fecha         DateTime
  horaInicio    String
  horaFin       String
  capacidad     Int
  precioEntrada Float
  actividadId   Int
  actividad     Actividad @relation(fields: [actividadId], references: [id])
  ubicacion     String?
  descripcion   String
  createdAt     DateTime  @default(now())
  entradas      Entrada[]
}
```

### Contrato de API

- **Ruta principal**: `DELETE /api/eventos/:id`
- **Autenticacion requerida**: Si.
- **Roles permitidos**: ADMIN.

### Request Body
```ts
// Sin body.
// Param: id numerico de evento.
```

### Response Body
```ts
{
  message: string
}
```

### Componentes Tecnicos

- **Route**
  - Registra la ruta principal `DELETE /api/eventos/:id`.
  - Aplica autenticacion y autorizacion segun el rol requerido.

- **Validation**
  - Valida parametros, body y archivos cuando corresponde.
  - Debe devolver errores claros para datos invalidos.

- **Controller**
  - Recibe el request HTTP.
  - Delega la logica en el servicio correspondiente.
  - Devuelve status code y respuesta JSON consistente.

- **Service**
  - Ejecuta reglas de negocio de la operacion `Delete` sobre `Evento`.
  - Usa Prisma Client para persistencia y consultas.
  - Debe manejar errores de dominio y base de datos de forma controlada.

- **Persistencia**
  - Usa el modelo Prisma `Evento` o los modelos relacionados indicados en el diseno.

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Codigo HTTP |
|---|---|---|
| sin token | La API debe rechazar la operacion con un error claro y consistente | 401 |
| rol no ADMIN | La API debe rechazar la operacion con un error claro y consistente | 403 |
| evento con entradas | error controlado o borrado dependiente | |
| id inexistente | La API debe rechazar la operacion con un error claro y consistente | 404 |

## Plan de Implementacion

1. Revisar la ruta `DELETE /api/eventos/:id` y confirmar middlewares de autenticacion/autorizacion.
2. Validar el contrato de entrada de la operacion `Delete`.
3. Implementar o ajustar el controlador de `Evento` para respuestas consistentes.
4. Implementar o ajustar el servicio de `Evento` con reglas de negocio y errores controlados.
5. Confirmar que Prisma respete relaciones, restricciones unicas e integridad referencial.
6. Agregar tests unitarios del servicio para escenario exitoso y errores de negocio.
7. Agregar tests de integracion para `DELETE /api/eventos/:id` cubriendo 2xx, 4xx y permisos.
8. Documentar ejemplos de request/response en la coleccion de pruebas o README tecnico.
