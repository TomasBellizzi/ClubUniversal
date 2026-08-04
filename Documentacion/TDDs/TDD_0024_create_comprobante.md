| Campo | Valor |
|---|---|
| ID | 0024 |
| Estado | Propuesto |
| Fecha | 2026-08-04 |
| Titulo | Carga de Comprobante |
| Clase | `Comprobante` |
| Operacion CRUD | `Create` |
| Ruta principal | `POST /api/cuotas/socio/:cuotaId/comprobante` |

---

# TDD-0024: Carga de Comprobante

---

## Contexto

### Objetivo
Permitir que el socio cargue comprobante de pago para una cuota propia.

### User Persona
- **Nombre**: Usuario del Club Universal con rol `SOCIO`
- **Necesidad**: Necesita ejecutar la operacion `Create` sobre `Comprobante` de forma clara, segura y trazable dentro del sistema simplificado del club.

### Criterios de Aceptacion
- archivo PDF/JPG/PNG.
- maximo 5MB.
- cuota debe pertenecer al socio autenticado.
- cuota pasa a EN_REVISION.

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

- **Ruta principal**: `POST /api/cuotas/socio/:cuotaId/comprobante`
- **Autenticacion requerida**: Si.
- **Roles permitidos**: SOCIO.

### Request Body
```ts
multipart/form-data
{
  comprobante: File; // PDF, JPG o PNG, max 5MB
}
```

### Response Body
```ts
{
  comprobante: Comprobante,
  cuota: Cuota,
  message: string
}
```

### Componentes Tecnicos

- **Route**
  - Registra la ruta principal `POST /api/cuotas/socio/:cuotaId/comprobante`.
  - Aplica autenticacion y autorizacion segun el rol requerido.

- **Validation**
  - Valida parametros, body y archivos cuando corresponde.
  - Debe devolver errores claros para datos invalidos.

- **Controller**
  - Recibe el request HTTP.
  - Delega la logica en el servicio correspondiente.
  - Devuelve status code y respuesta JSON consistente.

- **Service**
  - Ejecuta reglas de negocio de la operacion `Create` sobre `Comprobante`.
  - Usa Prisma Client para persistencia y consultas.
  - Debe manejar errores de dominio y base de datos de forma controlada.

- **Persistencia**
  - Usa el modelo Prisma `Comprobante` o los modelos relacionados indicados en el diseno.

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Codigo HTTP |
|---|---|---|
| archivo ausente | La API debe rechazar la operacion con un error claro y consistente | 400 |
| formato invalido | La API debe rechazar la operacion con un error claro y consistente | 400 |
| archivo mayor a 5MB | La API debe rechazar la operacion con un error claro y consistente | 400 |
| cuota ajena | La API debe rechazar la operacion con un error claro y consistente | 403 |

## Plan de Implementacion

1. Revisar la ruta `POST /api/cuotas/socio/:cuotaId/comprobante` y confirmar middlewares de autenticacion/autorizacion.
2. Validar el contrato de entrada de la operacion `Create`.
3. Implementar o ajustar el controlador de `Comprobante` para respuestas consistentes.
4. Implementar o ajustar el servicio de `Comprobante` con reglas de negocio y errores controlados.
5. Confirmar que Prisma respete relaciones, restricciones unicas e integridad referencial.
6. Agregar tests unitarios del servicio para escenario exitoso y errores de negocio.
7. Agregar tests de integracion para `POST /api/cuotas/socio/:cuotaId/comprobante` cubriendo 2xx, 4xx y permisos.
8. Documentar ejemplos de request/response en la coleccion de pruebas o README tecnico.
