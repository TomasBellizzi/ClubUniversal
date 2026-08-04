| Campo | Valor |
|---|---|
| ID | 0017 |
| Estado | Propuesto |
| Fecha | 2026-08-04 |
| Titulo | Alta o Venta de Entrada |
| Clase | `Entrada` |
| Operacion CRUD | `Create` |
| Ruta principal | `POST /api/entradas o POST /api/eventos/:id/venta` |

---

# TDD-0017: Alta o Venta de Entrada

---

## Contexto

### Objetivo
Registrar la compra o venta de entradas para un evento.

### User Persona
- **Nombre**: Usuario del Club Universal con rol `Autenticado / ADMINISTRATIVO segun flujo`
- **Necesidad**: Necesita ejecutar la operacion `Create` sobre `Entrada` de forma clara, segura y trazable dentro del sistema simplificado del club.

### Criterios de Aceptacion
- cantidad mayor a 0.
- evento debe existir.
- no superar capacidad disponible.
- socioId se toma del token en flujo socio cuando aplique.

## Diseno Tecnico

### Modelo de Datos
Se utilizan los modelos existentes de Prisma:

```prisma
model Entrada {
  id             Int         @id @default(autoincrement())
  eventoId       Int
  cantidad       Int
  precioUnitario Float
  total          Float
  fechaCompra    DateTime    @default(now())
  socioId        Int?
  createdAt      DateTime    @default(now())
  comprobanteUrl String?
  formaDePago    FormaDePago @default(EFECTIVO)
  evento         Evento      @relation(fields: [eventoId], references: [id])
  socio          Socio?      @relation(fields: [socioId], references: [id])
}
```

### Contrato de API

- **Ruta principal**: `POST /api/entradas o POST /api/eventos/:id/venta`
- **Autenticacion requerida**: Si.
- **Roles permitidos**: Autenticado / ADMINISTRATIVO segun flujo.

### Request Body
```ts
{
  eventoId: number;
  cantidad: number;
  socioId?: number;
  formaDePago: "EFECTIVO" | "CBU";
  comprobanteUrl?: string;
}
```

### Response Body
```ts
{
  entrada: Entrada,
  message: string
}
```

### Componentes Tecnicos

- **Route**
  - Registra la ruta principal `POST /api/entradas o POST /api/eventos/:id/venta`.
  - Aplica autenticacion y autorizacion segun el rol requerido.

- **Validation**
  - Valida parametros, body y archivos cuando corresponde.
  - Debe devolver errores claros para datos invalidos.

- **Controller**
  - Recibe el request HTTP.
  - Delega la logica en el servicio correspondiente.
  - Devuelve status code y respuesta JSON consistente.

- **Service**
  - Ejecuta reglas de negocio de la operacion `Create` sobre `Entrada`.
  - Usa Prisma Client para persistencia y consultas.
  - Debe manejar errores de dominio y base de datos de forma controlada.

- **Persistencia**
  - Usa el modelo Prisma `Entrada` o los modelos relacionados indicados en el diseno.

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Codigo HTTP |
|---|---|---|
| evento inexistente | La API debe rechazar la operacion con un error claro y consistente | 404 |
| sin cupo | La API debe rechazar la operacion con un error claro y consistente | 409 |
| cantidad invalida | La API debe rechazar la operacion con un error claro y consistente | 400 |
| comprobanteUrl invalida | La API debe rechazar la operacion con un error claro y consistente | 400 |

## Plan de Implementacion

1. Revisar la ruta `POST /api/entradas o POST /api/eventos/:id/venta` y confirmar middlewares de autenticacion/autorizacion.
2. Validar el contrato de entrada de la operacion `Create`.
3. Implementar o ajustar el controlador de `Entrada` para respuestas consistentes.
4. Implementar o ajustar el servicio de `Entrada` con reglas de negocio y errores controlados.
5. Confirmar que Prisma respete relaciones, restricciones unicas e integridad referencial.
6. Agregar tests unitarios del servicio para escenario exitoso y errores de negocio.
7. Agregar tests de integracion para `POST /api/entradas o POST /api/eventos/:id/venta` cubriendo 2xx, 4xx y permisos.
8. Documentar ejemplos de request/response en la coleccion de pruebas o README tecnico.
