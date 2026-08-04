| Campo | Valor |
|---|---|
| ID | 0021 |
| Estado | Propuesto |
| Fecha | 2026-08-04 |
| Titulo | Consulta de Cuotas |
| Clase | `Cuota` |
| Operacion CRUD | `Read` |
| Ruta principal | `GET /api/cuotas/socio, GET /api/cuotas/administrativo, GET /api/cuotas/admin` |

---

# TDD-0021: Consulta de Cuotas

---

## Contexto

### Objetivo
Consultar cuotas propias o cuotas para gestion administrativa.

### User Persona
- **Nombre**: Usuario del Club Universal con rol `SOCIO / ADMINISTRATIVO / ADMIN`
- **Necesidad**: Necesita ejecutar la operacion `Read` sobre `Cuota` de forma clara, segura y trazable dentro del sistema simplificado del club.

### Criterios de Aceptacion
- SOCIO solo ve sus cuotas.
- ADMINISTRATIVO ve cuotas para gestion.
- ADMIN ve vista completa.
- filtro por mes opcional.

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

- **Ruta principal**: `GET /api/cuotas/socio, GET /api/cuotas/administrativo, GET /api/cuotas/admin`
- **Autenticacion requerida**: Si.
- **Roles permitidos**: SOCIO / ADMINISTRATIVO / ADMIN.

### Request Body
```ts
// Sin body.
// Query opcional: mes.
```

### Response Body
```ts
{
  cuotas: Cuota[],
  total?: number
}
```

### Componentes Tecnicos

- **Route**
  - Registra la ruta principal `GET /api/cuotas/socio, GET /api/cuotas/administrativo, GET /api/cuotas/admin`.
  - Aplica autenticacion y autorizacion segun el rol requerido.

- **Validation**
  - Valida parametros, body y archivos cuando corresponde.
  - Debe devolver errores claros para datos invalidos.

- **Controller**
  - Recibe el request HTTP.
  - Delega la logica en el servicio correspondiente.
  - Devuelve status code y respuesta JSON consistente.

- **Service**
  - Ejecuta reglas de negocio de la operacion `Read` sobre `Cuota`.
  - Usa Prisma Client para persistencia y consultas.
  - Debe manejar errores de dominio y base de datos de forma controlada.

- **Persistencia**
  - Usa el modelo Prisma `Cuota` o los modelos relacionados indicados en el diseno.

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Codigo HTTP |
|---|---|---|
| sin token | La API debe rechazar la operacion con un error claro y consistente | 401 |
| rol incorrecto | La API debe rechazar la operacion con un error claro y consistente | 403 |
| mes invalido | La API debe rechazar la operacion con un error claro y consistente | 400 recomendado |

## Plan de Implementacion

1. Revisar la ruta `GET /api/cuotas/socio, GET /api/cuotas/administrativo, GET /api/cuotas/admin` y confirmar middlewares de autenticacion/autorizacion.
2. Validar el contrato de entrada de la operacion `Read`.
3. Implementar o ajustar el controlador de `Cuota` para respuestas consistentes.
4. Implementar o ajustar el servicio de `Cuota` con reglas de negocio y errores controlados.
5. Confirmar que Prisma respete relaciones, restricciones unicas e integridad referencial.
6. Agregar tests unitarios del servicio para escenario exitoso y errores de negocio.
7. Agregar tests de integracion para `GET /api/cuotas/socio, GET /api/cuotas/administrativo, GET /api/cuotas/admin` cubriendo 2xx, 4xx y permisos.
8. Documentar ejemplos de request/response en la coleccion de pruebas o README tecnico.
