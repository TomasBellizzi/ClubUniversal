| Campo | Valor |
|---|---|
| ID | 0014 |
| Estado | Propuesto |
| Fecha | 2026-08-04 |
| Titulo | Consulta de Eventos |
| Clase | `Evento` |
| Operacion CRUD | `Read` |
| Ruta principal | `GET /api/eventos y GET /api/eventos/:id` |

---

# TDD-0014: Consulta de Eventos

---

## Contexto

### Objetivo
Consultar eventos disponibles y su detalle.

### User Persona
- **Nombre**: Usuario del Club Universal con rol `Autenticado`
- **Necesidad**: Necesita ejecutar la operacion `Read` sobre `Evento` de forma clara, segura y trazable dentro del sistema simplificado del club.

### Criterios de Aceptacion
- requiere autenticacion.
- debe incluir datos de actividad cuando aplique.
- detalle por id debe existir.

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

- **Ruta principal**: `GET /api/eventos y GET /api/eventos/:id`
- **Autenticacion requerida**: Si.
- **Roles permitidos**: Autenticado.

### Request Body
```ts
// Sin body.
// Param opcional: id numerico.
```

### Response Body
```ts
{
  eventos: Evento[]
}

// o
{
  evento: Evento
}
```

### Componentes Tecnicos

- **Route**
  - Registra la ruta principal `GET /api/eventos y GET /api/eventos/:id`.
  - Aplica autenticacion y autorizacion segun el rol requerido.

- **Validation**
  - Valida parametros, body y archivos cuando corresponde.
  - Debe devolver errores claros para datos invalidos.

- **Controller**
  - Recibe el request HTTP.
  - Delega la logica en el servicio correspondiente.
  - Devuelve status code y respuesta JSON consistente.

- **Service**
  - Ejecuta reglas de negocio de la operacion `Read` sobre `Evento`.
  - Usa Prisma Client para persistencia y consultas.
  - Debe manejar errores de dominio y base de datos de forma controlada.

- **Persistencia**
  - Usa el modelo Prisma `Evento` o los modelos relacionados indicados en el diseno.

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Codigo HTTP |
|---|---|---|
| sin token | La API debe rechazar la operacion con un error claro y consistente | 401 |
| id inexistente | La API debe rechazar la operacion con un error claro y consistente | 404 |
| id invalido | La API debe rechazar la operacion con un error claro y consistente | 400 recomendado |

## Plan de Implementacion

1. Revisar la ruta `GET /api/eventos y GET /api/eventos/:id` y confirmar middlewares de autenticacion/autorizacion.
2. Validar el contrato de entrada de la operacion `Read`.
3. Implementar o ajustar el controlador de `Evento` para respuestas consistentes.
4. Implementar o ajustar el servicio de `Evento` con reglas de negocio y errores controlados.
5. Confirmar que Prisma respete relaciones, restricciones unicas e integridad referencial.
6. Agregar tests unitarios del servicio para escenario exitoso y errores de negocio.
7. Agregar tests de integracion para `GET /api/eventos y GET /api/eventos/:id` cubriendo 2xx, 4xx y permisos.
8. Documentar ejemplos de request/response en la coleccion de pruebas o README tecnico.
