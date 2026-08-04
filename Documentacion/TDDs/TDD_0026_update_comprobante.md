| Campo | Valor |
|---|---|
| ID | 0026 |
| Estado | Propuesto |
| Fecha | 2026-08-04 |
| Titulo | Cambio de Estado de Comprobante |
| Clase | `Comprobante` |
| Operacion CRUD | `Update` |
| Ruta principal | `PATCH /api/cuotas/:id/estado` |

---

# TDD-0026: Cambio de Estado de Comprobante

---

## Contexto

### Objetivo
Aprobar o rechazar un comprobante y reflejar el resultado en la cuota.

### User Persona
- **Nombre**: Usuario del Club Universal con rol `ADMIN / ADMINISTRATIVO`
- **Necesidad**: Necesita ejecutar la operacion `Update` sobre `Comprobante` de forma clara, segura y trazable dentro del sistema simplificado del club.

### Criterios de Aceptacion
- Aprobada marca cuota PAGADA.
- Rechazada inactiva comprobante y cuota vuelve a PENDIENTE.
- solo roles administrativos.

## Diseno Tecnico

### Modelo de Datos
Se utilizan los modelos existentes de Prisma:

```prisma
model Comprobante {
  id        Int      @id @default(autoincrement())
  cuotaId   Int
  url       String
  activo    Boolean  @default(true)
  subido_en DateTime @default(now())
  Cuota     Cuota    @relation(fields: [cuotaId], references: [id])

  @@unique([cuotaId, activo])
}
```

### Contrato de API

- **Ruta principal**: `PATCH /api/cuotas/:id/estado`
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
  comprobante: Comprobante,
  message: string
}
```

### Componentes Tecnicos

- **Route**
  - Registra la ruta principal `PATCH /api/cuotas/:id/estado`.
  - Aplica autenticacion y autorizacion segun el rol requerido.

- **Validation**
  - Valida parametros, body y archivos cuando corresponde.
  - Debe devolver errores claros para datos invalidos.

- **Controller**
  - Recibe el request HTTP.
  - Delega la logica en el servicio correspondiente.
  - Devuelve status code y respuesta JSON consistente.

- **Service**
  - Ejecuta reglas de negocio de la operacion `Update` sobre `Comprobante`.
  - Usa Prisma Client para persistencia y consultas.
  - Debe manejar errores de dominio y base de datos de forma controlada.

- **Persistencia**
  - Usa el modelo Prisma `Comprobante` o los modelos relacionados indicados en el diseno.

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Codigo HTTP |
|---|---|---|
| estado invalido | La API debe rechazar la operacion con un error claro y consistente | 400 |
| comprobante inexistente | La API debe rechazar la operacion con un error claro y consistente | 404 |
| rol SOCIO | La API debe rechazar la operacion con un error claro y consistente | 403 |
| sin token | La API debe rechazar la operacion con un error claro y consistente | 401 |

## Plan de Implementacion

1. Revisar la ruta `PATCH /api/cuotas/:id/estado` y confirmar middlewares de autenticacion/autorizacion.
2. Validar el contrato de entrada de la operacion `Update`.
3. Implementar o ajustar el controlador de `Comprobante` para respuestas consistentes.
4. Implementar o ajustar el servicio de `Comprobante` con reglas de negocio y errores controlados.
5. Confirmar que Prisma respete relaciones, restricciones unicas e integridad referencial.
6. Agregar tests unitarios del servicio para escenario exitoso y errores de negocio.
7. Agregar tests de integracion para `PATCH /api/cuotas/:id/estado` cubriendo 2xx, 4xx y permisos.
8. Documentar ejemplos de request/response en la coleccion de pruebas o README tecnico.
