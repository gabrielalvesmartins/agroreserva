import { Router } from 'express';
import { reservaController } from '../controllers/reserva.controller.js';
import { autenticar } from '../middlewares/autenticar.js';
import { validar } from '../middlewares/validar.js';
import { filtroReservasSchema, parametroId, reservaSchema } from '../validators/esquemas.js';

export const reservaRoutes = Router();

reservaRoutes.use(autenticar);
reservaRoutes.get('/', validar({ query: filtroReservasSchema }), reservaController.listar);
reservaRoutes.get('/:id', validar({ params: parametroId }), reservaController.buscar);
reservaRoutes.post('/', validar({ body: reservaSchema }), reservaController.criar);
reservaRoutes.put('/:id', validar({ params: parametroId, body: reservaSchema }), reservaController.atualizar);
reservaRoutes.patch('/:id/cancelar', validar({ params: parametroId }), reservaController.cancelar);
reservaRoutes.delete('/:id', validar({ params: parametroId }), reservaController.excluir);
