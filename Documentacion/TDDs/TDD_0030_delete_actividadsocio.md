| Campo | Valor |
|---|---|
| ID | 0030 |
| Estado | Propuesto |
| Fecha | 2026-08-04 |
| Titulo | Baja de Inscripcion |
| Clase | `ActividadSocio` |
| Operacion CRUD | `Delete` |
| Ruta principal | `DELETE /api/actividadSocio/:id` |

---

# TDD-0030: Baja de Inscripcion

---

## Contexto

### Objetivo
Eliminar la inscripcion de un socio a una actividad.

### User Persona
- **Nombre**: Usuario del Club Universal con rol `Autenticado`
- **Necesidad**: Necesita ejecutar la operacion `Delete` sobre `ActividadSocio` de forma clara, segura y trazable dentro del sistema simplificado del club.

### Criterios de Aceptacion
- debe eliminar solo la relacion.
- no debe borrar socio ni actividad.
- debe respetar permisos de ownership o rol.

## Diseno Tecnico

### Modelo de Datos
Se utilizan los modelos existentes de Prisma:

```prisma
model ActividadSocio {
  id           Int       @id @default(autoincrement())
  actividadId  Int
  socioId      Int
  actividad    Actividad @relation(fields: [actividadId], references: [id])
  Socio        Socio     @relation(fields: [socioId], references: [id])

  @@unique([actividadId, socioId])
}
```

### Contrato de API

- **Ruta principal**: `DELETE /api/actividadSocio/:id`
- **Autenticacion requerida**: Si.
- **Roles permitidos**: Autenticado.

### Request Body
```ts
// Sin body.
// Param: id numerico de inscripcion.
```

### Response Body
```ts
{
  message: string
}
```

### Componentes Tecnicos

- **Route**
  - Registra la ruta principal `DELETE /api/actividadSocio/:id`.
  - Aplica autenticacion y autorizacion segun el rol requerido.

- **Validation**
  - Valida parametros, body y archivos cuando corresponde.
  - Debe devolver errores claros para datos invalidos.

- **Controller**
  - Recibe el request HTTP.
  - Delega la logica en el servicio correspondiente.
  - Devuelve status code y respuesta JSON consistente.

- **Service**
  - Ejecuta reglas de negocio de la operacion `Delete` sobre `ActividadSocio`.
  - Usa Prisma Client para persistencia y consultas.
  - Debe manejar errores de dominio y base de datos de forma controlada.

- **Persistencia**
  - Usa el modelo Prisma `ActividadSocio` o los modelos relacionados indicados en el diseno.

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Codigo HTTP |
|---|---|---|
| sin token | La API debe rechazar la operacion con un error claro y consistente | 401 |
| inscripcion inexistente | La API debe rechazar la operacion con un error claro y consistente | 404 |
| intento sobre inscripcion ajena | La API debe rechazar la operacion con un error claro y consistente | 403 recomendado |

## Plan de Implementacion

1. Revisar la ruta `DELETE /api/actividadSocio/:id` y confirmar middlewares de autenticacion/autorizacion.
2. Validar el contrato de entrada de la operacion `Delete`.
3. Implementar o ajustar el controlador de `ActividadSocio` para respuestas consistentes.
4. Implementar o ajustar el servicio de `ActividadSocio` con reglas de negocio y errores controlados.
5. Confirmar que Prisma respete relaciones, restricciones unicas e integridad referencial.
6. Agregar tests unitarios del servicio para escenario exitoso y errores de negocio.
7. Agregar tests de integracion para `DELETE /api/actividadSocio/:id` cubriendo 2xx, 4xx y permisos.
8. Documentar ejemplos de request/response en la coleccion de pruebas o README tecnico.
