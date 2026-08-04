| Campo | Valor |
|---|---|
| ID | 0005 |
| Estado | Propuesto |
| Fecha | 2026-08-04 |
| Titulo | Alta de Socio |
| Clase | `Socio` |
| Operacion CRUD | `Create` |
| Ruta principal | `POST /api/auth/register` |

---

# TDD-0005: Alta de Socio

---

## Contexto

### Objetivo
Registrar un nuevo socio con usuario asociado para que pueda operar en el sistema.

### User Persona
- **Nombre**: Usuario del Club Universal con rol `Publico`
- **Necesidad**: Necesita ejecutar la operacion `Create` sobre `Socio` de forma clara, segura y trazable dentro del sistema simplificado del club.

### Criterios de Aceptacion
- role debe ser SOCIO.
- email valido.
- password minimo 6 caracteres.
- DNI de 8 digitos.
- datos de socio obligatorios.

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

- **Ruta principal**: `POST /api/auth/register`
- **Autenticacion requerida**: No.
- **Roles permitidos**: Publico.

### Request Body
```ts
{
  email: string;
  password: string;
  role: "SOCIO";
  socio: {
    nombre: string;
    apellido: string;
    dni: number;
    fechaNacimiento: string;
    pais: paisesLatam;
    sexo: "MASCULINO" | "FEMENINO" | "OTRO";
    fotoCarnet?: string | null;
  }
}
```

### Response Body
```ts
{
  success: true,
  message: "Registro exitoso",
  data: UsuarioConSocio
}
```

### Componentes Tecnicos

- **Route**
  - Registra la ruta principal `POST /api/auth/register`.
  - Aplica autenticacion y autorizacion segun el rol requerido.

- **Validation**
  - Valida parametros, body y archivos cuando corresponde.
  - Debe devolver errores claros para datos invalidos.

- **Controller**
  - Recibe el request HTTP.
  - Delega la logica en el servicio correspondiente.
  - Devuelve status code y respuesta JSON consistente.

- **Service**
  - Ejecuta reglas de negocio de la operacion `Create` sobre `Socio`.
  - Usa Prisma Client para persistencia y consultas.
  - Debe manejar errores de dominio y base de datos de forma controlada.

- **Persistencia**
  - Usa el modelo Prisma `Socio` o los modelos relacionados indicados en el diseno.

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Codigo HTTP |
|---|---|---|
| email duplicado | 400/409 | |
| dni duplicado | 400/409 | |
| role distinto de SOCIO | La API debe rechazar la operacion con un error claro y consistente | 403 |
| socio ausente | La API debe rechazar la operacion con un error claro y consistente | 400 |

## Plan de Implementacion

1. Revisar la ruta `POST /api/auth/register` y confirmar middlewares de autenticacion/autorizacion.
2. Validar el contrato de entrada de la operacion `Create`.
3. Implementar o ajustar el controlador de `Socio` para respuestas consistentes.
4. Implementar o ajustar el servicio de `Socio` con reglas de negocio y errores controlados.
5. Confirmar que Prisma respete relaciones, restricciones unicas e integridad referencial.
6. Agregar tests unitarios del servicio para escenario exitoso y errores de negocio.
7. Agregar tests de integracion para `POST /api/auth/register` cubriendo 2xx, 4xx y permisos.
8. Documentar ejemplos de request/response en la coleccion de pruebas o README tecnico.
