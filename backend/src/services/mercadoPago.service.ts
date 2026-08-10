import prisma from "../config/prisma";

const MERCADO_PAGO_API = "https://api.mercadopago.com";

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    const error = new Error(`${name} no configurado`);
    (error as any).statusCode = 503;
    (error as any).publicMessage = `Mercado Pago no esta configurado: falta ${name}`;
    throw error;
  }
  return value;
}

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function createMercadoPagoConfigError(message: string) {
  const error = new Error(message);
  (error as any).statusCode = 503;
  (error as any).publicMessage = `Mercado Pago no esta configurado correctamente: ${message}`;
  return error;
}

function getConfiguredUrl(name: string, developmentFallback: string) {
  const rawValue = process.env[name] || (!isProduction() ? developmentFallback : "");

  if (!rawValue) {
    throw createMercadoPagoConfigError(`falta ${name}`);
  }

  const value = rawValue.replace(/\/$/, "");

  try {
    const parsed = new URL(value);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("invalid protocol");
    }
  } catch {
    throw createMercadoPagoConfigError(`${name} no es una URL valida`);
  }

  if (isProduction() && isLocalUrl(value)) {
    throw createMercadoPagoConfigError(`${name} no puede apuntar a localhost en produccion`);
  }

  return value;
}

function getFrontendUrl() {
  return getConfiguredUrl("FRONTEND_URL", "http://localhost:5173");
}

function getBackendPublicUrl() {
  return getConfiguredUrl("BACKEND_PUBLIC_URL", "http://localhost:3000");
}

function isLocalUrl(url: string) {
  return /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?/i.test(url);
}

async function mercadoPagoFetch<T>(url: URL, options: RequestInit = {}): Promise<T> {
  const accessToken = getRequiredEnv("MERCADOPAGO_ACCESS_TOKEN");
  const response = await fetch(url.toString(), {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const body: any = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = body?.message || body?.error || "Error al comunicarse con Mercado Pago";
    const error = new Error(message);
    (error as any).statusCode = response.status;
    (error as any).publicMessage = `Mercado Pago rechazo la operacion: ${message}`;
    (error as any).details = body;
    throw error;
  }

  return body as T;
}

function buildPreferenceUrl() {
  return new URL("/checkout/preferences", MERCADO_PAGO_API);
}

function buildPaymentSearchUrl(searchParams: URLSearchParams) {
  const url = new URL("/v1/payments/search", MERCADO_PAGO_API);
  searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });
  return url;
}

function buildPaymentDetailUrl(paymentId: string) {
  if (!/^\d+$/.test(paymentId)) {
    throw Object.assign(new Error("ID de pago invalido"), { statusCode: 400 });
  }

  const safePaymentId = Number(paymentId);
  if (!Number.isSafeInteger(safePaymentId) || safePaymentId <= 0) {
    throw Object.assign(new Error("ID de pago invalido"), { statusCode: 400 });
  }

  return new URL(`/v1/payments/${safePaymentId}`, MERCADO_PAGO_API);
}

type PreferenceResponse = {
  id: string;
  init_point: string;
  sandbox_init_point?: string;
};

type PaymentResponse = {
  id: number | string;
  status: string;
  external_reference?: string;
};

type PaymentSearchResponse = {
  results?: PaymentResponse[];
};

function shouldSendPayerData() {
  return process.env.MERCADOPAGO_SEND_PAYER_DATA === "true";
}

function throwIfMercadoPagoMigrationMissing(error: any): never {
  const message = `${error?.message || ""} ${error?.meta?.column || ""}`;
  const isSchemaMismatch =
    ["P2010", "P2022"].includes(error?.code) ||
    /mercadoPago|estado_entrada|FormaDePago|column .* does not exist|invalid input value for enum/i.test(message);

  if (!isSchemaMismatch) throw error;

  const migrationError = new Error("Migracion de Mercado Pago para entradas no aplicada");
  (migrationError as any).statusCode = 503;
  (migrationError as any).publicMessage =
    "La base de datos del deploy no tiene aplicada la migracion de Mercado Pago para entradas. Ejecuta prisma migrate deploy antes de probar el pago.";
  (migrationError as any).details = {
    code: error?.code,
    meta: error?.meta,
  };
  throw migrationError;
}

export async function crearPreferenciaEntrada(eventoId: number, cantidad: number, socioId: number) {
  getRequiredEnv("MERCADOPAGO_ACCESS_TOKEN");
  const frontendUrl = getFrontendUrl();
  const backendUrl = getBackendPublicUrl();

  if (!Number.isInteger(eventoId) || eventoId <= 0) {
    throw Object.assign(new Error("ID de evento invalido"), { statusCode: 400 });
  }

  if (!Number.isInteger(cantidad) || cantidad <= 0) {
    throw Object.assign(new Error("La cantidad debe ser mayor a 0"), { statusCode: 400 });
  }

  const socio = await prisma.socio.findUnique({
    where: { id: socioId },
    include: { usuario: true },
  });

  if (!socio) {
    throw Object.assign(new Error("Socio no encontrado"), { statusCode: 404 });
  }

  const evento = await prisma.evento.findUnique({
    where: { id: eventoId },
    include: { actividad: true },
  });

  if (!evento) {
    throw Object.assign(new Error("Evento no encontrado"), { statusCode: 404 });
  }

  let entradasReservadas;
  try {
    entradasReservadas = await prisma.entrada.aggregate({
      _sum: { cantidad: true },
      where: {
        eventoId,
        estado: "PAGADA",
      },
    });
  } catch (error) {
    throwIfMercadoPagoMigrationMissing(error);
  }

  const vendidas = entradasReservadas._sum.cantidad || 0;
  if (vendidas + cantidad > evento.capacidad) {
    throw Object.assign(new Error("No hay suficientes entradas disponibles"), { statusCode: 409 });
  }

  const total = evento.precioEntrada * cantidad;
  const externalReference = `entrada:${eventoId}:${socioId}:${Date.now()}`;

  let entrada;
  try {
    entrada = await prisma.entrada.create({
      data: {
        eventoId,
        cantidad,
        precioUnitario: evento.precioEntrada,
        total,
        fechaCompra: new Date(),
        socioId,
        formaDePago: "MERCADOPAGO",
        estado: "PENDIENTE",
        mercadoPagoExternalReference: externalReference,
      },
      include: {
        evento: { include: { actividad: true } },
        socio: true,
      },
    });
  } catch (error) {
    throwIfMercadoPagoMigrationMissing(error);
  }

  const autoReturn = isLocalUrl(backendUrl) ? undefined : "approved";
  const payer = shouldSendPayerData()
    ? {
        name: socio.nombre,
        surname: socio.apellido,
        email: socio.usuario.email || socio.email,
        identification: {
          type: "DNI",
          number: String(socio.dni),
        },
      }
    : undefined;

  let preference: PreferenceResponse;
  try {
    preference = await mercadoPagoFetch<PreferenceResponse>(buildPreferenceUrl(), {
      method: "POST",
      body: JSON.stringify({
        items: [
          {
            id: String(evento.id),
            title: `Entrada - ${evento.nombre}`,
            description: evento.descripcion || evento.actividad?.nombre || "Entrada Club Universal",
            quantity: cantidad,
            unit_price: evento.precioEntrada,
            currency_id: "ARS",
          },
        ],
        ...(payer && { payer }),
        back_urls: {
          success: `${backendUrl}/api/eventos/mercadopago/retorno?entradaId=${entrada.id}&status=success`,
          failure: `${backendUrl}/api/eventos/mercadopago/retorno?entradaId=${entrada.id}&status=failure`,
          pending: `${backendUrl}/api/eventos/mercadopago/retorno?entradaId=${entrada.id}&status=pending`,
        },
        ...(autoReturn && { auto_return: autoReturn }),
        notification_url: `${backendUrl}/api/eventos/mercadopago/webhook`,
        external_reference: externalReference,
        metadata: {
          entrada_id: entrada.id,
          evento_id: evento.id,
          socio_id: socio.id,
          frontend_url: frontendUrl,
        },
      }),
    });
  } catch (error) {
    await prisma.entrada.update({
      where: { id: entrada.id },
      data: {
        estado: "CANCELADA",
        mercadoPagoStatus: "PREFERENCE_ERROR",
      },
    }).catch((updateError) => {
      console.error("No se pudo cancelar la entrada tras fallar Mercado Pago:", updateError);
    });

    throw error;
  }

  const updated = await prisma.entrada.update({
    where: { id: entrada.id },
    data: {
      mercadoPagoPreferenceId: preference.id,
    },
    include: {
      evento: { include: { actividad: true } },
      socio: true,
    },
  });

  return {
    entrada: updated,
    preferenceId: preference.id,
    initPoint: preference.init_point,
    sandboxInitPoint: preference.sandbox_init_point,
    redirectUrl: preference.sandbox_init_point || preference.init_point,
  };
}

export async function confirmarPagoPorPaymentId(paymentId: string) {
  const payment = await mercadoPagoFetch<PaymentResponse>(
    buildPaymentDetailUrl(paymentId)
  );

  if (!payment.external_reference) {
    return null;
  }

  const estado = payment.status === "approved" ? "PAGADA" : payment.status === "rejected" ? "CANCELADA" : "PENDIENTE";

  return prisma.entrada.update({
    where: { mercadoPagoExternalReference: payment.external_reference },
    data: {
      estado,
      mercadoPagoPaymentId: String(payment.id),
      mercadoPagoStatus: payment.status,
      fechaCompra: estado === "PAGADA" ? new Date() : undefined,
    },
    include: {
      evento: { include: { actividad: true } },
      socio: true,
    },
  });
}

export async function conciliarEntradaMercadoPago(entradaId: number, socioId: number) {
  const entrada = await prisma.entrada.findUnique({
    where: { id: entradaId },
    include: {
      evento: { include: { actividad: true } },
      socio: true,
    },
  });

  if (!entrada) {
    throw Object.assign(new Error("Entrada no encontrada"), { statusCode: 404 });
  }

  if (entrada.socioId !== socioId) {
    throw Object.assign(new Error("No podes consultar esta entrada"), { statusCode: 403 });
  }

  if (entrada.estado === "PAGADA") return entrada;

  if (!entrada.mercadoPagoExternalReference) {
    return entrada;
  }

  const searchParams = new URLSearchParams({
    external_reference: entrada.mercadoPagoExternalReference,
    sort: "date_created",
    criteria: "desc",
    limit: "1",
  });

  const search = await mercadoPagoFetch<PaymentSearchResponse>(
    buildPaymentSearchUrl(searchParams)
  );
  const payment = search.results?.[0];

  if (!payment) return entrada;

  const estado = payment.status === "approved" ? "PAGADA" : payment.status === "rejected" ? "CANCELADA" : "PENDIENTE";

  return prisma.entrada.update({
    where: { id: entrada.id },
    data: {
      estado,
      mercadoPagoPaymentId: String(payment.id),
      mercadoPagoStatus: payment.status,
      fechaCompra: estado === "PAGADA" ? new Date() : undefined,
    },
    include: {
      evento: { include: { actividad: true } },
      socio: true,
    },
  });
}

export async function confirmarRetornoEntrada(entradaId: number, paymentId?: string, collectionStatus?: string) {
  if (paymentId) {
    const entrada = await confirmarPagoPorPaymentId(paymentId);
    if (entrada) return entrada;
  }

  const estado = collectionStatus === "approved" ? "PAGADA" : collectionStatus === "rejected" ? "CANCELADA" : "PENDIENTE";

  return prisma.entrada.update({
    where: { id: entradaId },
    data: {
      estado,
      mercadoPagoPaymentId: paymentId,
      mercadoPagoStatus: collectionStatus,
      fechaCompra: estado === "PAGADA" ? new Date() : undefined,
    },
    include: {
      evento: { include: { actividad: true } },
      socio: true,
    },
  });
}

export function construirUrlFrontendResultado(status: string, entradaId?: number) {
  const url = new URL(`${getFrontendUrl()}/entradasSocio`);
  url.searchParams.set("mpStatus", status);
  if (entradaId) url.searchParams.set("entradaId", String(entradaId));
  return url.toString();
}
