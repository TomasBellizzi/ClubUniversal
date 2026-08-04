| Campo | Valor |
|---|---|
| ID | 0011 |
| Estado | Propuesto |
| Fecha | 2026-08-04 |
| Titulo | Modificacion de Usuario |
| Clase | `Usuario` |
| Operacion CRUD | `Update` |
| Ruta principal | `PUT /api/users/:id` |

---

# TDD-0011: Modificacion de Usuario

---

## Contexto

### Objetivo
Actualizar credenciales y datos asociados de usuario.

### User Persona
- **Nombre**: Usuario del Club Universal con rol `Autenticado con permisos`
- **Necesidad**: Necesita ejecutar la operacion `Update` sobre `Usuario` de forma clara, segura y trazable dentro del sistema simplificado del club.

### Criterios de Aceptacion
- password fuerte en update.
- si role SOCIO requiere datos de socio.
- si role ADMINISTRATIVO requiere datos administrativos.
- debe respetar permisos.

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

- **Ruta principal**: `PUT /api/users/:id`
- **Autenticacion requerida**: Si.
- **Roles permitidos**: Autenticado con permisos.

### Request Body
```ts
{
  email?: string;
  password?: string;
  role?: "ADMIN" | "ADMINISTRATIVO" | "SOCIO";
  socio?: Partial<Socio>;
  administrativo?: Partial<Administrativo>;
}
```

### Response Body
```ts
{
  user: Usuario,
  message: string
}
```

### Componentes Tecnicos

- **Route**
  - Registra la ruta principal `PUT /api/users/:id`.
  - Aplica autenticacion y autorizacion segun el rol requerido.

- **Validation**
  - Valida parametros, body y archivos cuando corresponde.
  - Debe devolver errores claros para datos invalidos.

- **Controller**
  - Recibe el request HTTP.
  - Delega la logica en el servicio correspondiente.
  - Devuelve status code y respuesta JSON consistente.

- **Service**
  - Ejecuta reglas de negocio de la operacion `Update` sobre `Usuario`.
  - Usa Prisma Client para persistencia y consultas.
  - Debe manejar errores de dominio y base de datos de forma controlada.

- **Persistencia**
  - Usa el modelo Prisma `Usuario` o los modelos relacionados indicados en el diseno.

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Codigo HTTP |
|---|---|---|
| email invalido | La API debe rechazar la operacion con un error claro y consistente | 400 |
| password debil | La API debe rechazar la operacion con un error claro y consistente | 400 |
| id inexistente | La API debe rechazar la operacion con un error claro y consistente | 404 |
| sin token | La API debe rechazar la operacion con un error claro y consistente | 401 |

## Plan de Implementacion

1. Revisar la ruta `PUT /api/users/:id` y confirmar middlewares de autenticacion/autorizacion.
2. Validar el contrato de entrada de la operacion `Update`.
3. Implementar o ajustar el controlador de `Usuario` para respuestas consistentes.
4. Implementar o ajustar el servicio de `Usuario` con reglas de negocio y errores controlados.
5. Confirmar que Prisma respete relaciones, restricciones unicas e integridad referencial.
6. Agregar tests unitarios del servicio para escenario exitoso y errores de negocio.
7. Agregar tests de integracion para `PUT /api/users/:id` cubriendo 2xx, 4xx y permisos.
8. Documentar ejemplos de request/response en la coleccion de pruebas o README tecnico.
