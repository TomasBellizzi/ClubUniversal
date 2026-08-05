require('dotenv').config();
import express from 'express';
import cors from 'cors';
import path from 'path';

// Middlewares
import { handleError } from './middlewares/error.middleware';
import { logRequest } from './middlewares/logger.middleware';

// Rutas de dominio
import socioRoutes from './routes/socioRoutes';
import { cuotaRoutes } from './routes/cuotaRoutes';
import { comprobanteRoutes } from './routes/comprobante.routes';
import { eventoRoutes } from './routes/evento.routes';
import { entradaRoutes } from './routes/entradas.routes';
import { ActividadRoutes } from './routes/actividad.routes';
import { actividadSocioRoutes } from './routes/actividadSocio.routes';

// Rutas de autenticación/usuarios
import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/user.routes';

const app = express();
const PORT = process.env.PORT || 3000;

console.log("🟩 FRONTEND_URL usado por el backend:", process.env.FRONTEND_URL);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'https://utn-ds-25-grupo3.vercel.app',
].filter(Boolean) as string[];

const corsOptions = {
  origin: function (origin: any, callback: any) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};


app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logRequest);
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));
app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Club Universal API',
    health: '/health',
  });
});
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});
app.use('/api/socios', socioRoutes);
app.use('/api/cuotas', cuotaRoutes);
app.use('/api/cuotas', comprobanteRoutes);
app.use('/api/entradas', entradaRoutes);
app.use('/api/eventos', eventoRoutes);
app.use('/api/actividades', ActividadRoutes);
app.use('/api/actividadSocio', actividadSocioRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use(handleError);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
