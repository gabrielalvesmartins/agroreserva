// "View" da API: define o formato JSON devolvido (nunca inclui senhaHash).
import { dataParaTexto } from './datas.js';

export const usuarioJson = (u) => ({ id: u.id, nome: u.nome, email: u.email, perfil: u.perfil });

export const maquinaJson = (m) => ({
  id: m.id,
  codigo: m.codigo,
  nome: m.nome,
  categoria: m.categoria,
  marca: m.marca,
  ano: m.ano,
  valorDiaria: Number(m.valorDiaria),
  descricao: m.descricao,
  status: m.status,
  // Períodos ocupados sem revelar quem reservou
  ocupacoes: (m.reservas ?? []).map((r) => ({
    reservaId: r.id,
    dataInicio: dataParaTexto(r.dataInicio),
    dataFim: dataParaTexto(r.dataFim),
  })),
});

export const reservaJson = (r) => ({
  id: r.id,
  maquinaId: r.maquinaId,
  usuarioId: r.usuarioId,
  dataInicio: dataParaTexto(r.dataInicio),
  dataFim: dataParaTexto(r.dataFim),
  propriedade: r.propriedade,
  finalidade: r.finalidade,
  valorTotal: Number(r.valorTotal),
  status: r.status,
  maquina: { id: r.maquina.id, codigo: r.maquina.codigo, nome: r.maquina.nome, status: r.maquina.status },
  usuario: { id: r.usuario.id, nome: r.usuario.nome, email: r.usuario.email },
});
