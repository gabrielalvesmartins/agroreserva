import { maquinaRepository } from '../repositories/maquina.repository.js';
import { reservaRepository } from '../repositories/reserva.repository.js';
import { AppError, naoEncontrado } from '../utils/AppError.js';

async function buscarOuFalhar(id, db) {
  const maquina = await maquinaRepository.buscarPorId(id, db);
  if (!maquina) throw naoEncontrado('A máquina');
  return maquina;
}

// Troca a mensagem genérica de valor único pela mensagem do campo código.
async function comCodigoUnico(operacao) {
  try {
    return await operacao();
  } catch (erro) {
    if (erro.code !== 'P2002') throw erro;
    const mensagem = 'Já existe uma máquina com este código.';
    throw new AppError(409, 'CODIGO_EM_USO', mensagem, [{ campo: 'codigo', mensagem }]);
  }
}

export const maquinaService = {
  listar: (filtros) => maquinaRepository.listar(filtros),
  buscar: (id) => buscarOuFalhar(id),
  criar: (dados) => comCodigoUnico(() => maquinaRepository.criar(dados)),

  // Regra: máquina com reservas vigentes ou futuras não pode ser retirada de operação.
  atualizar: (id, dados) =>
    comCodigoUnico(() =>
      reservaRepository.transacao(async (tx) => {
        await maquinaRepository.travar(id, tx);
        const atual = await buscarOuFalhar(id, tx);
        if (dados.status !== 'DISPONIVEL' && atual.status === 'DISPONIVEL' && atual.reservas.length > 0) {
          throw new AppError(
            409,
            'MAQUINA_COM_RESERVAS',
            `A máquina tem ${atual.reservas.length} reserva(s) vigente(s) ou futura(s). Cancele-as antes de mudar a situação.`,
          );
        }
        return maquinaRepository.atualizar(id, dados, tx);
      }),
    ),

  // Regra: máquina com histórico de reservas não é excluída, para preservar os registros.
  excluir: (id) =>
    reservaRepository.transacao(async (tx) => {
      await maquinaRepository.travar(id, tx);
      await buscarOuFalhar(id, tx);
      if ((await maquinaRepository.contarReservas(id, tx)) > 0) {
        throw new AppError(
          409,
          'MAQUINA_COM_HISTORICO',
          'A máquina possui reservas registradas e não pode ser excluída. Altere a situação para Inativa.',
        );
      }
      await maquinaRepository.excluir(id, tx);
    }),
};
