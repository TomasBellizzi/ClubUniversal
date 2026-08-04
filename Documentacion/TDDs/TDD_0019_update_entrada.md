| Campo | Valor |
|---|---|
| ID | 0019 |
| Estado | Propuesto |
| Fecha | 2026-08-04 |
| Titulo | Modificacion de Entrada |
| Clase | `Entrada` |
| Operacion CRUD | `Update` |
| Ruta principal | `PUT /api/entradas/:id` |

---

# TDD-0019: Modificacion de Entrada

---

## Contexto

### Objetivo
Actualizar datos administrativos de una entrada.

### User Persona
- **Nombre**: Usuario del Club Universal con rol `ADMIN / ADMINISTRATIVO`
- **Necesidad**: Necesita ejecutar la operacion `Update` sobre `Entrada` de forma clara, segura y trazable dentro del sistema simplificado del club.

### Criterios de Aceptacion
- solo administrativo/admin.
- cantidad positiva si se envia.
- debe recalcular total si cambia cantidad.

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

- **Ruta principal**: `PUT /api/entradas/:id`
- **Autenticacion requerida**: Si.
- **Roles permitidos**: ADMIN / ADMINISTRATIVO.

### Request Body
```ts
{
  cantidad?: number;
  formaDePago?: "EFECTIVO" | "CBU";
  comprobanteUrl?: string;
}
```

### Response Body
```ts
{
  entrada: Entrada,
  message: string
}
```

### Componentes Tecnicos

- **Route**
  - Registra la ruta principal `PUT /api/entradas/:id`.
  - Aplica autenticacion y autorizacion segun el rol requerido.

- **Validation**
  - Valida parametros, body y archivos cuando corresponde.
  - Debe devolver errores claros para datos invalidos.

- **Controller**
  - Recibe el request HTTP.
  - Delega la logica en el servicio correspondiente.
  - Devuelve status code y respuesta JSON consistente.

- **Service**
  - Ejecuta reglas de negocio de la operacion `Update` sobre `Entrada`.
  - Usa Prisma Client para persistencia y consultas.
  - Debe manejar errores de dominio y base de datos de forma controlada.

- **Persistencia**
  - Usa el modelo Prisma `Entrada` o los modelos relacionados indicados en el diseno.

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Codigo HTTP |
|---|---|---|
| rol SOCIO | La API debe rechazar la operacion con un error claro y consistente | 403 |
| cantidad invalida | La API debe rechazar la operacion con un error claro y consistente | 400 |
| id inexistente | La API debe rechazar la operacion con un error claro y consistente | 404 |
| nuevo total supera cupo | La API debe rechazar la operacion con un error claro y consistente | 409 recomendado |

## Plan de Implementacion

1. Revisar la ruta `PUT /api/entradas/:id` y confirmar middlewares de autenticacion/autorizacion.
2. Validar el contrato de entrada de la operacion `Update`.
3. Implementar o ajustar el controlador de `Entrada` para respuestas consistentes.
4. Implementar o ajustar el servicio de `Entrada` con reglas de negocio y errores controlados.
5. Confirmar que Prisma respete relaciones, restricciones unicas e integridad referencial.
6. Agregar tests unitarios del servicio para escenario exitoso y errores de negocio.
7. Agregar tests de integracion para `PUT /api/entradas/:id` cubriendo 2xx, 4xx y permisos.
8. Documentar ejemplos de request/response en la coleccion de pruebas o README tecnico.
