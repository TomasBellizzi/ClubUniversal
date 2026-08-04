| Campo | Valor |
|---|---|
| ID | 0013 |
| Estado | Propuesto |
| Fecha | 2026-08-04 |
| Titulo | Alta de Evento |
| Clase | `Evento` |
| Operacion CRUD | `Create` |
| Ruta principal | `POST /api/eventos` |

---

# TDD-0013: Alta de Evento

---

## Contexto

### Objetivo
Crear un evento asociado a una actividad, con capacidad y precio de entrada.

### User Persona
- **Nombre**: Usuario del Club Universal con rol `ADMIN / ADMINISTRATIVO`
- **Necesidad**: Necesita ejecutar la operacion `Create` sobre `Evento` de forma clara, segura y trazable dentro del sistema simplificado del club.

### Criterios de Aceptacion
- actividadId debe existir.
- capacidad positiva.
- precio positivo.
- fecha valida.

## Diseno Tecnico

### Modelo de Datos
Se utilizan los modelos existentes de Prisma:

```prisma
model Evento {
  id            Int       @id @default(autoincrement())
  nombre        String
  fecha         DateTime
  horaInicio    String
  horaFin       String
  capacidad     Int
  precioEntrada Float
  actividadId   Int
  actividad     Actividad @relation(fields: [actividadId], references: [id])
  ubicacion     String?
  descripcion   String
  createdAt     DateTime  @default(now())
  entradas      Entrada[]
}
```

### Contrato de API

- **Ruta principal**: `POST /api/eventos`
- **Autenticacion requerida**: Si.
- **Roles permitidos**: ADMIN / ADMINISTRATIVO.

### Request Body
```ts
{
  nombre: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  capacidad: number;
  precioEntrada: number;
  actividadId: number;
  ubicacion?: string;
  descripcion?: string;
}
```

### Response Body
```ts
{
  evento: Evento,
  message: string
}
```

### Componentes Tecnicos

- **Route**
  - Registra la ruta principal `POST /api/eventos`.
  - Aplica autenticacion y autorizacion segun el rol requerido.

- **Validation**
  - Valida parametros, body y archivos cuando corresponde.
  - Debe devolver errores claros para datos invalidos.

- **Controller**
  - Recibe el request HTTP.
  - Delega la logica en el servicio correspondiente.
  - Devuelve status code y respuesta JSON consistente.

- **Service**
  - Ejecuta reglas de negocio de la operacion `Create` sobre `Evento`.
  - Usa Prisma Client para persistencia y consultas.
  - Debe manejar errores de dominio y base de datos de forma controlada.

- **Persistencia**
  - Usa el modelo Prisma `Evento` o los modelos relacionados indicados en el diseno.

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Codigo HTTP |
|---|---|---|
| actividad inexistente | 400/404 | |
| capacidad negativa | La API debe rechazar la operacion con un error claro y consistente | 400 |
| fecha invalida | La API debe rechazar la operacion con un error claro y consistente | 400 |
| rol SOCIO | La API debe rechazar la operacion con un error claro y consistente | 403 |

## Plan de Implementacion

1. Revisar la ruta `POST /api/eventos` y confirmar middlewares de autenticacion/autorizacion.
2. Validar el contrato de entrada de la operacion `Create`.
3. Implementar o ajustar el controlador de `Evento` para respuestas consistentes.
4. Implementar o ajustar el servicio de `Evento` con reglas de negocio y errores controlados.
5. Confirmar que Prisma respete relaciones, restricciones unicas e integridad referencial.
6. Agregar tests unitarios del servicio para escenario exitoso y errores de negocio.
7. Agregar tests de integracion para `POST /api/eventos` cubriendo 2xx, 4xx y permisos.
8. Documentar ejemplos de request/response en la coleccion de pruebas o README tecnico.
