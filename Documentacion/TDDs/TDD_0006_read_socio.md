| Campo | Valor |
|---|---|
| ID | 0006 |
| Estado | Propuesto |
| Fecha | 2026-08-04 |
| Titulo | Consulta de Socios |
| Clase | `Socio` |
| Operacion CRUD | `Read` |
| Ruta principal | `GET /api/socios, GET /api/socios/dni/:dni, GET /api/socios/dni/:dni/full` |

---

# TDD-0006: Consulta de Socios

---

## Contexto

### Objetivo
Consultar socios para gestion administrativa.

### User Persona
- **Nombre**: Usuario del Club Universal con rol `ADMIN / ADMINISTRATIVO`
- **Necesidad**: Necesita ejecutar la operacion `Read` sobre `Socio` de forma clara, segura y trazable dentro del sistema simplificado del club.

### Criterios de Aceptacion
- solo roles administrativos.
- busqueda por DNI.
- consulta completa debe incluir relaciones utiles.

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

- **Ruta principal**: `GET /api/socios, GET /api/socios/dni/:dni, GET /api/socios/dni/:dni/full`
- **Autenticacion requerida**: Si.
- **Roles permitidos**: ADMIN / ADMINISTRATIVO.

### Request Body
```ts
// Sin body.
// Param opcional: dni numerico.
```

### Response Body
```ts
{
  socios: Socio[]
}

// o
{
  socio: Socio
}
```

### Componentes Tecnicos

- **Route**
  - Registra la ruta principal `GET /api/socios, GET /api/socios/dni/:dni, GET /api/socios/dni/:dni/full`.
  - Aplica autenticacion y autorizacion segun el rol requerido.

- **Validation**
  - Valida parametros, body y archivos cuando corresponde.
  - Debe devolver errores claros para datos invalidos.

- **Controller**
  - Recibe el request HTTP.
  - Delega la logica en el servicio correspondiente.
  - Devuelve status code y respuesta JSON consistente.

- **Service**
  - Ejecuta reglas de negocio de la operacion `Read` sobre `Socio`.
  - Usa Prisma Client para persistencia y consultas.
  - Debe manejar errores de dominio y base de datos de forma controlada.

- **Persistencia**
  - Usa el modelo Prisma `Socio` o los modelos relacionados indicados en el diseno.

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Codigo HTTP |
|---|---|---|
| sin token | La API debe rechazar la operacion con un error claro y consistente | 401 |
| rol SOCIO | La API debe rechazar la operacion con un error claro y consistente | 403 |
| dni inexistente | La API debe rechazar la operacion con un error claro y consistente | 404 |
| dni invalido | La API debe rechazar la operacion con un error claro y consistente | 400 recomendado |

## Plan de Implementacion

1. Revisar la ruta `GET /api/socios, GET /api/socios/dni/:dni, GET /api/socios/dni/:dni/full` y confirmar middlewares de autenticacion/autorizacion.
2. Validar el contrato de entrada de la operacion `Read`.
3. Implementar o ajustar el controlador de `Socio` para respuestas consistentes.
4. Implementar o ajustar el servicio de `Socio` con reglas de negocio y errores controlados.
5. Confirmar que Prisma respete relaciones, restricciones unicas e integridad referencial.
6. Agregar tests unitarios del servicio para escenario exitoso y errores de negocio.
7. Agregar tests de integracion para `GET /api/socios, GET /api/socios/dni/:dni, GET /api/socios/dni/:dni/full` cubriendo 2xx, 4xx y permisos.
8. Documentar ejemplos de request/response en la coleccion de pruebas o README tecnico.
