| Campo | Valor |
|---|---|
| ID | 0010 |
| Estado | Propuesto |
| Fecha | 2026-08-04 |
| Titulo | Consulta de Usuarios |
| Clase | `Usuario` |
| Operacion CRUD | `Read` |
| Ruta principal | `GET /api/users, GET /api/users/:id, GET /api/users/administrativos, GET /api/users/socios` |

---

# TDD-0010: Consulta de Usuarios

---

## Contexto

### Objetivo
Consultar usuarios y sus perfiles asociados.

### User Persona
- **Nombre**: Usuario del Club Universal con rol `ADMIN / ADMINISTRATIVO segun ruta`
- **Necesidad**: Necesita ejecutar la operacion `Read` sobre `Usuario` de forma clara, segura y trazable dentro del sistema simplificado del club.

### Criterios de Aceptacion
- ADMIN puede listar usuarios.
- ADMINISTRATIVO puede listar socios.
- detalle debe respetar permisos.

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

- **Ruta principal**: `GET /api/users, GET /api/users/:id, GET /api/users/administrativos, GET /api/users/socios`
- **Autenticacion requerida**: Si.
- **Roles permitidos**: ADMIN / ADMINISTRATIVO segun ruta.

### Request Body
```ts
// Sin body.
// Param opcional: id numerico.
```

### Response Body
```ts
{
  users: Usuario[]
}

// o
{
  user: Usuario
}
```

### Componentes Tecnicos

- **Route**
  - Registra la ruta principal `GET /api/users, GET /api/users/:id, GET /api/users/administrativos, GET /api/users/socios`.
  - Aplica autenticacion y autorizacion segun el rol requerido.

- **Validation**
  - Valida parametros, body y archivos cuando corresponde.
  - Debe devolver errores claros para datos invalidos.

- **Controller**
  - Recibe el request HTTP.
  - Delega la logica en el servicio correspondiente.
  - Devuelve status code y respuesta JSON consistente.

- **Service**
  - Ejecuta reglas de negocio de la operacion `Read` sobre `Usuario`.
  - Usa Prisma Client para persistencia y consultas.
  - Debe manejar errores de dominio y base de datos de forma controlada.

- **Persistencia**
  - Usa el modelo Prisma `Usuario` o los modelos relacionados indicados en el diseno.

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Codigo HTTP |
|---|---|---|
| sin token | La API debe rechazar la operacion con un error claro y consistente | 401 |
| rol insuficiente | La API debe rechazar la operacion con un error claro y consistente | 403 |
| id inexistente | La API debe rechazar la operacion con un error claro y consistente | 404 |

## Plan de Implementacion

1. Revisar la ruta `GET /api/users, GET /api/users/:id, GET /api/users/administrativos, GET /api/users/socios` y confirmar middlewares de autenticacion/autorizacion.
2. Validar el contrato de entrada de la operacion `Read`.
3. Implementar o ajustar el controlador de `Usuario` para respuestas consistentes.
4. Implementar o ajustar el servicio de `Usuario` con reglas de negocio y errores controlados.
5. Confirmar que Prisma respete relaciones, restricciones unicas e integridad referencial.
6. Agregar tests unitarios del servicio para escenario exitoso y errores de negocio.
7. Agregar tests de integracion para `GET /api/users, GET /api/users/:id, GET /api/users/administrativos, GET /api/users/socios` cubriendo 2xx, 4xx y permisos.
8. Documentar ejemplos de request/response en la coleccion de pruebas o README tecnico.
