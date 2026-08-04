| Campo | Valor |
|---|---|
| ID | 0012 |
| Estado | Propuesto |
| Fecha | 2026-08-04 |
| Titulo | Baja de Usuario |
| Clase | `Usuario` |
| Operacion CRUD | `Delete` |
| Ruta principal | `DELETE /api/users/:id` |

---

# TDD-0012: Baja de Usuario

---

## Contexto

### Objetivo
Eliminar un usuario del sistema cuando corresponda.

### User Persona
- **Nombre**: Usuario del Club Universal con rol `ADMIN`
- **Necesidad**: Necesita ejecutar la operacion `Delete` sobre `Usuario` de forma clara, segura y trazable dentro del sistema simplificado del club.

### Criterios de Aceptacion
- solo ADMIN.
- debe considerar relaciones socio/administrativo.
- no debe permitir borrados no autorizados.

## Diseno Tecnico

### Modelo de Datos
Se utilizan los modelos existentes de Prisma:

```prisma
model Usuario {
  id              Int              @id @default(autoincrement())
  email           String           @unique
  password        String
  rol             String
  creadoEn        DateTime         @default(now())
  socio           Socio?
  administrativo  Administrativo?
}
```

### Contrato de API

- **Ruta principal**: `DELETE /api/users/:id`
- **Autenticacion requerida**: Si.
- **Roles permitidos**: ADMIN.

### Request Body
```ts
// Sin body.
// Param: id numerico de usuario.
```

### Response Body
```ts
{
  message: string
}
```

### Componentes Tecnicos

- **Route**
  - Registra la ruta principal `DELETE /api/users/:id`.
  - Aplica autenticacion y autorizacion segun el rol requerido.

- **Validation**
  - Valida parametros, body y archivos cuando corresponde.
  - Debe devolver errores claros para datos invalidos.

- **Controller**
  - Recibe el request HTTP.
  - Delega la logica en el servicio correspondiente.
  - Devuelve status code y respuesta JSON consistente.

- **Service**
  - Ejecuta reglas de negocio de la operacion `Delete` sobre `Usuario`.
  - Usa Prisma Client para persistencia y consultas.
  - Debe manejar errores de dominio y base de datos de forma controlada.

- **Persistencia**
  - Usa el modelo Prisma `Usuario` o los modelos relacionados indicados en el diseno.

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Codigo HTTP |
|---|---|---|
| sin token | La API debe rechazar la operacion con un error claro y consistente | 401 |
| rol no ADMIN | La API debe rechazar la operacion con un error claro y consistente | 403 |
| id inexistente | La API debe rechazar la operacion con un error claro y consistente | 404 |
| usuario con dependencias | error controlado o baja logica recomendada | |

## Plan de Implementacion

1. Revisar la ruta `DELETE /api/users/:id` y confirmar middlewares de autenticacion/autorizacion.
2. Validar el contrato de entrada de la operacion `Delete`.
3. Implementar o ajustar el controlador de `Usuario` para respuestas consistentes.
4. Implementar o ajustar el servicio de `Usuario` con reglas de negocio y errores controlados.
5. Confirmar que Prisma respete relaciones, restricciones unicas e integridad referencial.
6. Agregar tests unitarios del servicio para escenario exitoso y errores de negocio.
7. Agregar tests de integracion para `DELETE /api/users/:id` cubriendo 2xx, 4xx y permisos.
8. Documentar ejemplos de request/response en la coleccion de pruebas o README tecnico.
