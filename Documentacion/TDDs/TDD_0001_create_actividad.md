| Campo | Valor |
|---|---|
| ID | 0001 |
| Estado | Propuesto |
| Fecha | 2026-08-04 |
| Titulo | Alta de Actividad |
| Clase | `Actividad` |
| Operacion CRUD | `Create` |
| Ruta principal | `POST /api/actividades` |

---

# TDD-0001: Alta de Actividad

---

## Contexto

### Objetivo
Crear una actividad deportiva disponible para inscripcion y cobro de cuota.

### User Persona
- **Nombre**: Usuario del Club Universal con rol `ADMIN / ADMINISTRATIVO`
- **Necesidad**: Necesita ejecutar la operacion `Create` sobre `Actividad` de forma clara, segura y trazable dentro del sistema simplificado del club.

### Criterios de Aceptacion
- nombre obligatorio.
- monto mayor o igual a 0.
- requiere JWT.
- requiere rol administrativo.

## Diseno Tecnico

### Modelo de Datos
Se utilizan los modelos existentes de Prisma:

```prisma
model Actividad {
  id              Int               @id @default(autoincrement())
  nombre          String
  monto           Float
  activo          Boolean           @default(true)
  createdAt       DateTime          @default(now())
  cuotaXactividad cuotaXactividad[]
  socios          ActividadSocio[]
  eventos         Evento[]
}
```

### Contrato de API

- **Ruta principal**: `POST /api/actividades`
- **Autenticacion requerida**: Si.
- **Roles permitidos**: ADMIN / ADMINISTRATIVO.

### Request Body
```ts
{
  nombre: string;
  monto: number;
  activo?: boolean;
}
```

### Response Body
```ts
{
  actividad: {
    id: number,
    nombre: string,
    monto: number,
    activo: boolean,
    createdAt: string
  },
  message: "Actividad creada correctamente"
}
```

### Componentes Tecnicos

- **Route**
  - Registra la ruta principal `POST /api/actividades`.
  - Aplica autenticacion y autorizacion segun el rol requerido.

- **Validation**
  - Valida parametros, body y archivos cuando corresponde.
  - Debe devolver errores claros para datos invalidos.

- **Controller**
  - Recibe el request HTTP.
  - Delega la logica en el servicio correspondiente.
  - Devuelve status code y respuesta JSON consistente.

- **Service**
  - Ejecuta reglas de negocio de la operacion `Create` sobre `Actividad`.
  - Usa Prisma Client para persistencia y consultas.
  - Debe manejar errores de dominio y base de datos de forma controlada.

- **Persistencia**
  - Usa el modelo Prisma `Actividad` o los modelos relacionados indicados en el diseno.

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Codigo HTTP |
|---|---|---|
| Body vacio | La API debe rechazar la operacion con un error claro y consistente | 400 |
| nombre vacio | La API debe rechazar la operacion con un error claro y consistente | 400 |
| monto negativo | La API debe rechazar la operacion con un error claro y consistente | 400 |
| sin token | La API debe rechazar la operacion con un error claro y consistente | 401 |
| rol SOCIO | La API debe rechazar la operacion con un error claro y consistente | 403 |

## Plan de Implementacion

1. Revisar la ruta `POST /api/actividades` y confirmar middlewares de autenticacion/autorizacion.
2. Validar el contrato de entrada de la operacion `Create`.
3. Implementar o ajustar el controlador de `Actividad` para respuestas consistentes.
4. Implementar o ajustar el servicio de `Actividad` con reglas de negocio y errores controlados.
5. Confirmar que Prisma respete relaciones, restricciones unicas e integridad referencial.
6. Agregar tests unitarios del servicio para escenario exitoso y errores de negocio.
7. Agregar tests de integracion para `POST /api/actividades` cubriendo 2xx, 4xx y permisos.
8. Documentar ejemplos de request/response en la coleccion de pruebas o README tecnico.
