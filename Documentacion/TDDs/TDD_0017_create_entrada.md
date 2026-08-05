| Campo | Valor |
|---|---|
| ID | 0017 |
| Estado | Propuesto |
| Fecha | 2026-08-04 |
| Titulo | Alta o Venta de Entrada |
| Clase | `Entrada` |
| Operacion CRUD | `Create` |
| Ruta principal | `POST /api/entradas` o `POST /api/eventos/:id/mercadopago/preferencia` |

---

# TDD-0017: Alta o Venta de Entrada

---

## Contexto

### Objetivo
Registrar la compra o venta de entradas para un evento. Las ventas presenciales se cargan desde el flujo administrativo. Las compras online del socio se inician mediante una preferencia de Mercado Pago y quedan pagadas cuando Mercado Pago confirma la operacion.

### User Persona
- **Nombre**: Usuario del Club Universal con rol `SOCIO / ADMINISTRATIVO segun flujo`
- **Necesidad**: Necesita ejecutar la operacion `Create` sobre `Entrada` de forma clara, segura y trazable dentro del sistema simplificado del club.

### Criterios de Aceptacion
- cantidad mayor a 0.
- evento debe existir.
- no superar capacidad disponible.
- socioId se toma del token en el flujo online del socio.
- la compra online debe crear una entrada `PENDIENTE` y redirigir a Mercado Pago.
- la entrada debe pasar a `PAGADA` cuando Mercado Pago confirme el pago aprobado.

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
  estado          estado_entrada @default(PAGADA)
  mercadoPagoPreferenceId String? @unique
  mercadoPagoPaymentId    String?
  mercadoPagoStatus       String?
  mercadoPagoExternalReference String? @unique
  evento         Evento      @relation(fields: [eventoId], references: [id])
  socio          Socio?      @relation(fields: [socioId], references: [id])
}

enum FormaDePago {
  CBU
  EFECTIVO
  MERCADOPAGO
}

enum estado_entrada {
  PENDIENTE
  PAGADA
  CANCELADA
}
```

### Contrato de API

- **Ruta principal**: `POST /api/entradas` o `POST /api/eventos/:id/mercadopago/preferencia`
- **Autenticacion requerida**: Si.
- **Roles permitidos**: `ADMIN / ADMINISTRATIVO` para venta presencial, `SOCIO` para compra online.

### Request Body
```ts
{
  eventoId: number;
  cantidad: number;
  socioId?: number;
  formaDePago: "EFECTIVO" | "CBU";
  comprobanteUrl?: string;
}

// Compra online socio con Mercado Pago
{
  cantidad: number;
}
```

### Response Body
```ts
{
  entrada: Entrada,
  message: string
}

// Compra online socio con Mercado Pago
{
  entrada: Entrada,
  preferenceId: string,
  initPoint: string,
  sandboxInitPoint?: string,
  redirectUrl: string
}
```

### Componentes Tecnicos

- **Route**
  - Registra la ruta principal `POST /api/entradas` para admin y `POST /api/eventos/:id/mercadopago/preferencia` para socio.
  - Aplica autenticacion y autorizacion segun el rol requerido.

- **Validation**
  - Valida parametros, body y archivos cuando corresponde.
  - Debe devolver errores claros para datos invalidos.

- **Controller**
  - Recibe el request HTTP.
  - Delega la logica en el servicio correspondiente.
  - Devuelve status code y respuesta JSON consistente.

- **Service**
  - Ejecuta reglas de negocio de la operacion `Create` sobre `Entrada`.
  - Crea preferencia de Mercado Pago para compras online.
  - Actualiza `estado`, `mercadoPagoPaymentId` y `mercadoPagoStatus` en retorno/webhook.
  - Usa Prisma Client para persistencia y consultas.
  - Debe manejar errores de dominio y base de datos de forma controlada.

- **Persistencia**
  - Usa el modelo Prisma `Entrada` o los modelos relacionados indicados en el diseno.

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Codigo HTTP |
|---|---|---|
| evento inexistente | La API debe rechazar la operacion con un error claro y consistente | 404 |
| sin cupo | La API debe rechazar la operacion con un error claro y consistente | 409 |
| cantidad invalida | La API debe rechazar la operacion con un error claro y consistente | 400 |
| comprobanteUrl invalida | La API debe rechazar la operacion con un error claro y consistente | 400 |
| token de Mercado Pago no configurado | La API debe rechazar la operacion con un error claro y consistente | 500 |
| Mercado Pago no devuelve URL de pago | La API debe rechazar la operacion con un error claro y consistente | 502 |
| retorno de pago rechazado | La entrada debe quedar `CANCELADA` | 200 |

## Plan de Implementacion

1. Revisar la ruta `POST /api/entradas` y `POST /api/eventos/:id/mercadopago/preferencia` y confirmar middlewares de autenticacion/autorizacion.
2. Validar el contrato de entrada de la operacion `Create`.
3. Implementar o ajustar el controlador de `Entrada` para respuestas consistentes.
4. Implementar o ajustar el servicio de `Entrada` con reglas de negocio y errores controlados.
5. Confirmar que Prisma respete relaciones, restricciones unicas e integridad referencial.
6. Agregar tests unitarios del servicio para escenario exitoso y errores de negocio.
7. Agregar tests de integracion para `POST /api/entradas` y `POST /api/eventos/:id/mercadopago/preferencia` cubriendo 2xx, 4xx y permisos.
8. Documentar ejemplos de request/response en la coleccion de pruebas o README tecnico.
