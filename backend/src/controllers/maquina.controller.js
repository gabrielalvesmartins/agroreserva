import { maquinaService } from '../services/maquina.service.js';
import { maquinaJson } from '../utils/apresentacao.js';

export const maquinaController = {
  async listar(req, res) {
    const maquinas = await maquinaService.listar(req.validado.query);
    res.json(maquinas.map(maquinaJson));
  },
  async buscar(req, res) {
    res.json(maquinaJson(await maquinaService.buscar(req.validado.params.id)));
  },
  async criar(req, res) {
    res.status(201).json(maquinaJson(await maquinaService.criar(req.validado.body)));
  },
  async atualizar(req, res) {
    res.json(maquinaJson(await maquinaService.atualizar(req.validado.params.id, req.validado.body)));
  },
  async excluir(req, res) {
    await maquinaService.excluir(req.validado.params.id);
    res.status(204).end();
  },
};
