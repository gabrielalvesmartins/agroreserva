import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { autenticar } from '../middlewares/autenticar.js';
import { validar } from '../middlewares/validar.js';
import { cadastroSchema, loginSchema } from '../validators/esquemas.js';

export const authRoutes = Router();

authRoutes.post('/cadastro', validar({ body: cadastroSchema }), authController.cadastrar);
authRoutes.post('/login', validar({ body: loginSchema }), authController.entrar);
authRoutes.get('/eu', autenticar, authController.eu);
