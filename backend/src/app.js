import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { rotaNaoEncontrada, tratarErros } from './middlewares/tratarErros.js';
import { authRoutes } from './routes/auth.routes.js';
import { maquinaRoutes } from './routes/maquina.routes.js';
import { reservaRoutes } from './routes/reserva.routes.js';

export const app = express();

app.disable('x-powered-by');
app.use(cors({ origin: env.corsOrigins }));
app.use(express.json({ limit: '50kb' }));

app.get('/api/saude', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/maquinas', maquinaRoutes);
app.use('/api/reservas', reservaRoutes);

app.use(rotaNaoEncontrada);
app.use(tratarErros);
