| Campo | Valor |
|---|---|
| ID | 0009 |
| Estado | Propuesto |
| Fecha | 2026-08-04 |
| Titulo | Alta de Administrativo |
| Clase | `Administrativo` |
| Operacion CRUD | `Create` |
| Ruta principal | `POST /api/auth/register/administrativo` |

---

# TDD-0009: Alta de Administrativo

---

## Contexto

### Objetivo
Crear un usuario administrativo autorizado para gestionar el club.

### User Persona
- **Nombre**: Usuario del Club Universal con rol `ADMIN`
- **Necesidad**: Necesita ejecutar la operacion `Create` sobre `Administrativo` de forma clara, segura y trazable dentro del sistema simplificado del club.

### Criterios de Aceptacion
- requiere token de ADMIN.
- role debe ser ADMINISTRATIVO.
- email valido.
- DNI de 8 digitos.

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

model Administrativo {
  id        Int      @id @default(autoincrement())
  usuarioId Int      @unique
  usuario   Usuario  @relation(fields: [usuarioId], references: [id])
  nombre    String
  apellido  String
  dni       Int      @unique
  activo    Boolean  @default(true)
}
```

### Contrato de API

- **Ruta principal**: `POST /api/auth/register/administrativo`
- **Autenticacion requerida**: Si.
- **Roles permitidos**: ADMIN.

### Request Body
```ts
{
  email: string;
  password: string;
  role: "ADMINISTRATIVO";
  administrativo: {
    nombre: string;
    apellido: string;
    dni: number;
    activo?: boolean;
  }
}
```

### Response Body
```ts
{
  success: true,
  message: "Registro exitoso",
  data: UsuarioConAdministrativo
}
```

### Componentes Tecnicos

- **Route**
  - Registra la ruta principal `POST /api/auth/register/administrativo`.
  - Aplica autenticacion y autorizacion segun el rol requerido.

- **Validation**
  - Valida parametros, body y archivos cuando corresponde.
  - Debe devolver errores claros para datos invalidos.

- **Controller**
  - Recibe el request HTTP.
  - Delega la logica en el servicio correspondiente.
  - Devuelve status code y respuesta JSON consistente.

- **Service**
  - Ejecuta reglas de negocio de la operacion `Create` sobre `Administrativo`.
  - Usa Prisma Client para persistencia y consultas.
  - Debe manejar errores de dominio y base de datos de forma controlada.

- **Persistencia**
  - Usa el modelo Prisma `Administrativo` o los modelos relacionados indicados en el diseno.

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Codigo HTTP |
|---|---|---|
| sin token | La API debe rechazar la operacion con un error claro y consistente | 401 |
| rol no ADMIN | La API debe rechazar la operacion con un error claro y consistente | 403 |
| email duplicado | 400/409 | |
| administrativo ausente | La API debe rechazar la operacion con un error claro y consistente | 400 |

## Plan de Implementacion

1. Revisar la ruta `POST /api/auth/register/administrativo` y confirmar middlewares de autenticacion/autorizacion.
2. Validar el contrato de entrada de la operacion `Create`.
3. Implementar o ajustar el controlador de `Administrativo` para respuestas consistentes.
4. Implementar o ajustar el servicio de `Administrativo` con reglas de negocio y errores controlados.
5. Confirmar que Prisma respete relaciones, restricciones unicas e integridad referencial.
6. Agregar tests unitarios del servicio para escenario exitoso y errores de negocio.
7. Agregar tests de integracion para `POST /api/auth/register/administrativo` cubriendo 2xx, 4xx y permisos.
8. Documentar ejemplos de request/response en la coleccion de pruebas o README tecnico.
