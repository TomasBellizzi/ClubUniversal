import rateLimit from "express-rate-limit";

export const mercadoPagoLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Demasiadas solicitudes. Intenta nuevamente en unos minutos.",
  },
});

export const authSensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Demasiados intentos. Intenta nuevamente en unos minutos.",
  },
});

export const adminReadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Demasiadas solicitudes. Intenta nuevamente en unos minutos.",
  },
});
