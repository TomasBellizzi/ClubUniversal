| Campo | Valor |
|---|---|
| ID | 0025 |
| Estado | Propuesto |
| Fecha | 2026-08-04 |
| Titulo | Consulta de Comprobante |
| Clase | `Comprobante` |
| Operacion CRUD | `Read` |
| Ruta principal | `GET /api/cuotas/:id` |

---

# TDD-0025: Consulta de Comprobante

---

## Contexto

### Objetivo
Consultar detalle de comprobante asociado a una cuota.

### User Persona
- **Nombre**: Usuario del Club Universal con rol `ADMIN / ADMINISTRATIVO`
- **Necesidad**: Necesita ejecutar la operacion `Read` sobre `Comprobante` de forma clara, segura y trazable dentro del sistema simplificado del club.

### Criterios de Aceptacion
- solo administrativo/admin.
- debe devolver comprobante activo.
- debe permitir revision administrativa.

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

- **Ruta principal**: `GET /api/cuotas/:id`
- **Autenticacion requerida**: Si.
- **Roles permitidos**: ADMIN / ADMINISTRATIVO.

### Request Body
```ts
// Sin body.
// Param: id numerico.
```

### Response Body
```ts
{
  comprobante: Comprobante,
  cuota: Cuota
}
```

### Componentes Tecnicos

- **Route**
  - Registra la ruta principal `GET /api/cuotas/:id`.
  - Aplica autenticacion y autorizacion segun el rol requerido.

- **Validation**
  - Valida parametros, body y archivos cuando corresponde.
  - Debe devolver errores claros para datos invalidos.

- **Controller**
  - Recibe el request HTTP.
  - Delega la logica en el servicio correspondiente.
  - Devuelve status code y respuesta JSON consistente.

- **Service**
  - Ejecuta reglas de negocio de la operacion `Read` sobre `Comprobante`.
  - Usa Prisma Client para persistencia y consultas.
  - Debe manejar errores de dominio y base de datos de forma controlada.

- **Persistencia**
  - Usa el modelo Prisma `Comprobante` o los modelos relacionados indicados en el diseno.

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Codigo HTTP |
|---|---|---|
| sin token | La API debe rechazar la operacion con un error claro y consistente | 401 |
| rol SOCIO | La API debe rechazar la operacion con un error claro y consistente | 403 |
| comprobante inexistente | La API debe rechazar la operacion con un error claro y consistente | 404 |

## Plan de Implementacion

1. Revisar la ruta `GET /api/cuotas/:id` y confirmar middlewares de autenticacion/autorizacion.
2. Validar el contrato de entrada de la operacion `Read`.
3. Implementar o ajustar el controlador de `Comprobante` para respuestas consistentes.
4. Implementar o ajustar el servicio de `Comprobante` con reglas de negocio y errores controlados.
5. Confirmar que Prisma respete relaciones, restricciones unicas e integridad referencial.
6. Agregar tests unitarios del servicio para escenario exitoso y errores de negocio.
7. Agregar tests de integracion para `GET /api/cuotas/:id` cubriendo 2xx, 4xx y permisos.
8. Documentar ejemplos de request/response en la coleccion de pruebas o README tecnico.
