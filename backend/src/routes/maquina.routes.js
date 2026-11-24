import { Router } from 'express';
import { maquinaController } from '../controllers/maquina.controller.js';
import { autenticar, exigirPerfil } from '../middlewares/autenticar.js';
import { validar } from '../middlewares/validar.js';
import { filtroMaquinasSchema, maquinaSchema, parametroId } from '../validators/esquemas.js';

const admin = exigirPerfil('ADMIN');
export const maquinaRoutes = Router();

maquinaRoutes.use(autenticar);
maquinaRoutes.get('/', validar({ query: filtroMaquinasSchema }), maquinaController.listar);
maquinaRoutes.get('/:id', validar({ params: parametroId }), maquinaController.buscar);
maquinaRoutes.post('/', admin, validar({ body: maquinaSchema }), maquinaController.criar);
maquinaRoutes.put('/:id', admin, validar({ params: parametroId, body: maquinaSchema }), maquinaController.atualizar);
maquinaRoutes.delete('/:id', admin, validar({ params: parametroId }), maquinaController.excluir);
