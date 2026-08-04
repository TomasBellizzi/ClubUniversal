| Campo | Valor |
|---|---|
| ID | 0022 |
| Estado | Propuesto |
| Fecha | 2026-08-04 |
| Titulo | Cambio de Estado de Cuota |
| Clase | `Cuota` |
| Operacion CRUD | `Update` |
| Ruta principal | `PATCH /api/cuotas/administrativo/:id/estado` |

---

# TDD-0022: Cambio de Estado de Cuota

---

## Contexto

### Objetivo
Aprobar o rechazar una cuota en revision segun comprobante.

### User Persona
- **Nombre**: Usuario del Club Universal con rol `ADMIN / ADMINISTRATIVO`
- **Necesidad**: Necesita ejecutar la operacion `Update` sobre `Cuota` de forma clara, segura y trazable dentro del sistema simplificado del club.

### Criterios de Aceptacion
- Aprobada debe pasar a PAGADA.
- Rechazada debe volver a PENDIENTE.
- solo cuotas existentes.
- registrar fecha_pago cuando corresponda.

## Diseno Tecnico

### Modelo de Datos
Se utilizan los modelos existentes de Prisma:

```prisma
model Cuota {
  id                 Int          @id @default(autoincrement())
  fecha_pago         DateTime?    @db.Date
  fecha_vencimiento  DateTime     @db.Date
  metodo_pago        FormaDePago
  monto              Decimal      @db.Decimal(12, 3)
  estado             estado_cuota @default(PENDIENTE)
  created_at         DateTime     @default(now()) @db.Timestamptz(6)
  socio_id           Int
  mes                Mes?
  comprobantes       Comprobante[]
  Socio              Socio        @relation(fields: [socio_id], references: [id], onUpdate: NoAction)
  cuotaXactividad    cuotaXactividad[]

  @@unique([socio_id, mes])
  @@index([estado], map: "id_cuota_estado")
}
```

### Contrato de API

- **Ruta principal**: `PATCH /api/cuotas/administrativo/:id/estado`
- **Autenticacion requerida**: Si.
- **Roles permitidos**: ADMIN / ADMINISTRATIVO.

### Request Body
```ts
{
  estado: "Aprobada" | "Rechazada"
}
```

### Response Body
```ts
{
  cuota: Cuota,
  message: string
}
```

### Componentes Tecnicos

- **Route**
  - Registra la ruta principal `PATCH /api/cuotas/administrativo/:id/estado`.
  - Aplica autenticacion y autorizacion segun el rol requerido.

- **Validation**
  - Valida parametros, body y archivos cuando corresponde.
  - Debe devolver errores claros para datos invalidos.

- **Controller**
  - Recibe el request HTTP.
  - Delega la logica en el servicio correspondiente.
  - Devuelve status code y respuesta JSON consistente.

- **Service**
  - Ejecuta reglas de negocio de la operacion `Update` sobre `Cuota`.
  - Usa Prisma Client para persistencia y consultas.
  - Debe manejar errores de dominio y base de datos de forma controlada.

- **Persistencia**
  - Usa el modelo Prisma `Cuota` o los modelos relacionados indicados en el diseno.

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Codigo HTTP |
|---|---|---|
| estado invalido | La API debe rechazar la operacion con un error claro y consistente | 400 |
| cuota inexistente | La API debe rechazar la operacion con un error claro y consistente | 404 |
| sin token | La API debe rechazar la operacion con un error claro y consistente | 401 |
| rol SOCIO | La API debe rechazar la operacion con un error claro y consistente | 403 |

## Plan de Implementacion

1. Revisar la ruta `PATCH /api/cuotas/administrativo/:id/estado` y confirmar middlewares de autenticacion/autorizacion.
2. Validar el contrato de entrada de la operacion `Update`.
3. Implementar o ajustar el controlador de `Cuota` para respuestas consistentes.
4. Implementar o ajustar el servicio de `Cuota` con reglas de negocio y errores controlados.
5. Confirmar que Prisma respete relaciones, restricciones unicas e integridad referencial.
6. Agregar tests unitarios del servicio para escenario exitoso y errores de negocio.
7. Agregar tests de integracion para `PATCH /api/cuotas/administrativo/:id/estado` cubriendo 2xx, 4xx y permisos.
8. Documentar ejemplos de request/response en la coleccion de pruebas o README tecnico.
