| Campo | Valor |
|---|---|
| ID | 0007 |
| Estado | Propuesto |
| Fecha | 2026-08-04 |
| Titulo | Modificacion de Socio |
| Clase | `Socio` |
| Operacion CRUD | `Update` |
| Ruta principal | `PUT /api/socios` |

---

# TDD-0007: Modificacion de Socio

---

## Contexto

### Objetivo
Actualizar datos personales y foto de carnet de un socio.

### User Persona
- **Nombre**: Usuario del Club Universal con rol `ADMIN / ADMINISTRATIVO`
- **Necesidad**: Necesita ejecutar la operacion `Update` sobre `Socio` de forma clara, segura y trazable dentro del sistema simplificado del club.

### Criterios de Aceptacion
- requiere identificador de socio.
- permite multipart para foto.
- solo administrativo/admin.

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

- **Ruta principal**: `PUT /api/socios`
- **Autenticacion requerida**: Si.
- **Roles permitidos**: ADMIN / ADMINISTRATIVO.

### Request Body
```ts
{
  id: number;
  nombre?: string;
  apellido?: string;
  email?: string;
  fechaNacimiento?: string;
  pais?: paisesLatam;
  sexo?: "MASCULINO" | "FEMENINO" | "OTRO";
  fotoCarnet?: File | string | null;
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
  - Registra la ruta principal `PUT /api/socios`.
  - Aplica autenticacion y autorizacion segun el rol requerido.

- **Validation**
  - Valida parametros, body y archivos cuando corresponde.
  - Debe devolver errores claros para datos invalidos.

- **Controller**
  - Recibe el request HTTP.
  - Delega la logica en el servicio correspondiente.
  - Devuelve status code y respuesta JSON consistente.

- **Service**
  - Ejecuta reglas de negocio de la operacion `Update` sobre `Socio`.
  - Usa Prisma Client para persistencia y consultas.
  - Debe manejar errores de dominio y base de datos de forma controlada.

- **Persistencia**
  - Usa el modelo Prisma `Socio` o los modelos relacionados indicados en el diseno.

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Codigo HTTP |
|---|---|---|
| id inexistente | La API debe rechazar la operacion con un error claro y consistente | 404 |
| email invalido | La API debe rechazar la operacion con un error claro y consistente | 400 |
| sin token | La API debe rechazar la operacion con un error claro y consistente | 401 |
| rol SOCIO | La API debe rechazar la operacion con un error claro y consistente | 403 |

## Plan de Implementacion

1. Revisar la ruta `PUT /api/socios` y confirmar middlewares de autenticacion/autorizacion.
2. Validar el contrato de entrada de la operacion `Update`.
3. Implementar o ajustar el controlador de `Socio` para respuestas consistentes.
4. Implementar o ajustar el servicio de `Socio` con reglas de negocio y errores controlados.
5. Confirmar que Prisma respete relaciones, restricciones unicas e integridad referencial.
6. Agregar tests unitarios del servicio para escenario exitoso y errores de negocio.
7. Agregar tests de integracion para `PUT /api/socios` cubriendo 2xx, 4xx y permisos.
8. Documentar ejemplos de request/response en la coleccion de pruebas o README tecnico.
