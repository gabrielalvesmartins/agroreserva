import { authService } from '../services/auth.service.js';
import { usuarioJson } from '../utils/apresentacao.js';

export const authController = {
  async cadastrar(req, res) {
    res.status(201).json(await authService.cadastrar(req.validado.body));
  },
  async entrar(req, res) {
    res.json(await authService.entrar(req.validado.body));
  },
  eu(req, res) {
    res.json(usuarioJson(req.usuario));
  },
};
