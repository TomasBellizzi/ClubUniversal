| Campo | Valor |
|---|---|
| ID | 0008 |
| Estado | Propuesto |
| Fecha | 2026-08-04 |
| Titulo | Cambio de Estado de Socio |
| Clase | `Socio` |
| Operacion CRUD | `Update Estado` |
| Ruta principal | `PUT /api/socios/:id/estado` |

---

# TDD-0008: Cambio de Estado de Socio

---

## Contexto

### Objetivo
Activar o inactivar un socio sin eliminar su historial.

### User Persona
- **Nombre**: Usuario del Club Universal con rol `ADMIN / ADMINISTRATIVO`
- **Necesidad**: Necesita ejecutar la operacion `Update Estado` sobre `Socio` de forma clara, segura y trazable dentro del sistema simplificado del club.

### Criterios de Aceptacion
- estado solo ACTIVO o INACTIVO.
- debe persistir el cambio.
- login de socio inactivo debe quedar bloqueado.

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

model Socio {
  id              Int          @id @default(autoincrement())
  nombre          String
  apellido        String
  email           String
  fechaNacimiento DateTime
  pais            paisesLatam
  sexo            Sexo
  fotoCarnet      String?
  dni             Int          @unique
  usuarioId       Int          @unique
  estado          String       @default("ACTIVO")
  actividades     ActividadSocio[]
  Cuota           Cuota[]
  entradas        Entrada[]
  usuario         Usuario      @relation(fields: [usuarioId], references: [id])
}
```

### Contrato de API

- **Ruta principal**: `PUT /api/socios/:id/estado`
- **Autenticacion requerida**: Si.
- **Roles permitidos**: ADMIN / ADMINISTRATIVO.

### Request Body
```ts
{
  estado: "ACTIVO" | "INACTIVO"
}
```

### Response Body
```ts
{
  socio: Socio,
  message: string
}
```

### Componentes Tecnicos

- **Route**
  - Registra la ruta principal `PUT /api/socios/:id/estado`.
  - Aplica autenticacion y autorizacion segun el rol requerido.

- **Validation**
  - Valida parametros, body y archivos cuando corresponde.
  - Debe devolver errores claros para datos invalidos.

- **Controller**
  - Recibe el request HTTP.
  - Delega la logica en el servicio correspondiente.
  - Devuelve status code y respuesta JSON consistente.

- **Service**
  - Ejecuta reglas de negocio de la operacion `Update Estado` sobre `Socio`.
  - Usa Prisma Client para persistencia y consultas.
  - Debe manejar errores de dominio y base de datos de forma controlada.

- **Persistencia**
  - Usa el modelo Prisma `Socio` o los modelos relacionados indicados en el diseno.

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Codigo HTTP |
|---|---|---|
| estado invalido | La API debe rechazar la operacion con un error claro y consistente | 400 |
| id inexistente | La API debe rechazar la operacion con un error claro y consistente | 404 |
| sin token | La API debe rechazar la operacion con un error claro y consistente | 401 |
| rol SOCIO | La API debe rechazar la operacion con un error claro y consistente | 403 |

## Plan de Implementacion

1. Revisar la ruta `PUT /api/socios/:id/estado` y confirmar middlewares de autenticacion/autorizacion.
2. Validar el contrato de entrada de la operacion `Update Estado`.
3. Implementar o ajustar el controlador de `Socio` para respuestas consistentes.
4. Implementar o ajustar el servicio de `Socio` con reglas de negocio y errores controlados.
5. Confirmar que Prisma respete relaciones, restricciones unicas e integridad referencial.
6. Agregar tests unitarios del servicio para escenario exitoso y errores de negocio.
7. Agregar tests de integracion para `PUT /api/socios/:id/estado` cubriendo 2xx, 4xx y permisos.
8. Documentar ejemplos de request/response en la coleccion de pruebas o README tecnico.
