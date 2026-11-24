import { reservaService } from '../services/reserva.service.js';
import { reservaJson } from '../utils/apresentacao.js';

export const reservaController = {
  async listar(req, res) {
    const reservas = await reservaService.listar(req.validado.query, req.usuario);
    res.json(reservas.map(reservaJson));
  },
  async buscar(req, res) {
    res.json(reservaJson(await reservaService.buscar(req.validado.params.id, req.usuario)));
  },
  async criar(req, res) {
    res.status(201).json(reservaJson(await reservaService.criar(req.validado.body, req.usuario)));
  },
  async atualizar(req, res) {
    const { params, body } = req.validado;
    res.json(reservaJson(await reservaService.atualizar(params.id, body, req.usuario)));
  },
  async cancelar(req, res) {
    res.json(reservaJson(await reservaService.cancelar(req.validado.params.id, req.usuario)));
  },
  async excluir(req, res) {
    await reservaService.excluir(req.validado.params.id, req.usuario);
    res.status(204).end();
  },
};
