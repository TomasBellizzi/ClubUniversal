| Campo | Valor |
|---|---|
| ID | 0018 |
| Estado | Propuesto |
| Fecha | 2026-08-04 |
| Titulo | Consulta de Entradas |
| Clase | `Entrada` |
| Operacion CRUD | `Read` |
| Ruta principal | `GET /api/entradas y GET /api/entradas/:id` |

---

# TDD-0018: Consulta de Entradas

---

## Contexto

### Objetivo
Consultar entradas propias o ventas segun rol.

### User Persona
- **Nombre**: Usuario del Club Universal con rol `Autenticado`
- **Necesidad**: Necesita ejecutar la operacion `Read` sobre `Entrada` de forma clara, segura y trazable dentro del sistema simplificado del club.

### Criterios de Aceptacion
- SOCIO debe ver sus entradas.
- ADMIN/ADMINISTRATIVO pueden consultar ventas.
- detalle debe respetar ownership.

## Diseno Tecnico

### Modelo de Datos
Se utilizan los modelos existentes de Prisma:

```prisma
model Entrada {
  id             Int         @id @default(autoincrement())
  eventoId       Int
  cantidad       Int
  precioUnitario Float
  total          Float
  fechaCompra    DateTime    @default(now())
  socioId        Int?
  createdAt      DateTime    @default(now())
  comprobanteUrl String?
  formaDePago    FormaDePago @default(EFECTIVO)
  evento         Evento      @relation(fields: [eventoId], references: [id])
  socio          Socio?      @relation(fields: [socioId], references: [id])
}
```

### Contrato de API

- **Ruta principal**: `GET /api/entradas y GET /api/entradas/:id`
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
  entradas: Entrada[]
}

// o
{
  entrada: Entrada
}
```

### Componentes Tecnicos

- **Route**
  - Registra la ruta principal `GET /api/entradas y GET /api/entradas/:id`.
  - Aplica autenticacion y autorizacion segun el rol requerido.

- **Validation**
  - Valida parametros, body y archivos cuando corresponde.
  - Debe devolver errores claros para datos invalidos.

- **Controller**
  - Recibe el request HTTP.
  - Delega la logica en el servicio correspondiente.
  - Devuelve status code y respuesta JSON consistente.

- **Service**
  - Ejecuta reglas de negocio de la operacion `Read` sobre `Entrada`.
  - Usa Prisma Client para persistencia y consultas.
  - Debe manejar errores de dominio y base de datos de forma controlada.

- **Persistencia**
  - Usa el modelo Prisma `Entrada` o los modelos relacionados indicados en el diseno.

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Codigo HTTP |
|---|---|---|
| sin token | La API debe rechazar la operacion con un error claro y consistente | 401 |
| entrada ajena | La API debe rechazar la operacion con un error claro y consistente | 403 |
| id inexistente | La API debe rechazar la operacion con un error claro y consistente | 404 |

## Plan de Implementacion

1. Revisar la ruta `GET /api/entradas y GET /api/entradas/:id` y confirmar middlewares de autenticacion/autorizacion.
2. Validar el contrato de entrada de la operacion `Read`.
3. Implementar o ajustar el controlador de `Entrada` para respuestas consistentes.
4. Implementar o ajustar el servicio de `Entrada` con reglas de negocio y errores controlados.
5. Confirmar que Prisma respete relaciones, restricciones unicas e integridad referencial.
6. Agregar tests unitarios del servicio para escenario exitoso y errores de negocio.
7. Agregar tests de integracion para `GET /api/entradas y GET /api/entradas/:id` cubriendo 2xx, 4xx y permisos.
8. Documentar ejemplos de request/response en la coleccion de pruebas o README tecnico.
