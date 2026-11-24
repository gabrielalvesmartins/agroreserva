import { maquinaRepository } from '../repositories/maquina.repository.js';
import { reservaRepository } from '../repositories/reserva.repository.js';
import { AppError, acessoNegado, naoEncontrado } from '../utils/AppError.js';
import { contarDias, dataParaTexto, formatarBr, hoje, somarDias, textoParaData } from '../utils/datas.js';

const MAX_DIAS_RESERVA = 30;
const MAX_DIAS_ANTECEDENCIA = 365;

const regra = (codigo, mensagem) => new AppError(409, codigo, mensagem);
const ehAdmin = (usuario) => usuario.perfil === 'ADMIN';

// Autorização: só o dono da reserva ou um administrador tem acesso a ela.
async function buscarComPermissao(id, usuario, db) {
  const reserva = await reservaRepository.buscarPorId(id, db);
  if (!reserva) throw naoEncontrado('A reserva');
  if (reserva.usuarioId !== usuario.id && !ehAdmin(usuario)) {
    throw acessoNegado('Você só pode acessar as suas próprias reservas.');
  }
  return reserva;
}

// Depois que o uso começou, apenas o administrador pode mexer na reserva.
function exigirNaoIniciada(reserva, usuario) {
  if (!ehAdmin(usuario) && dataParaTexto(reserva.dataInicio) <= hoje()) {
    throw regra('RESERVA_INICIADA', 'A reserva já começou. Fale com o administrador para alterá-la.');
  }
}

// REGRA DE NEGÓCIO PRINCIPAL: a mesma máquina não pode ter reservas sobrepostas.
// Deve ser chamada dentro de uma transação, por causa da trava na linha da máquina.
async function validarRegras(dados, tx, reservaAtual) {
  const { maquinaId, dataInicio, dataFim } = dados;

  await maquinaRepository.travar(maquinaId, tx);
  const maquina = await maquinaRepository.buscarPorId(maquinaId, tx);
  if (!maquina) throw naoEncontrado('A máquina');
  if (maquina.status !== 'DISPONIVEL') {
    throw regra('MAQUINA_INDISPONIVEL', 'Esta máquina está em manutenção ou inativa e não pode ser reservada.');
  }

  const manteveInicio = reservaAtual && dataParaTexto(reservaAtual.dataInicio) === dataInicio;
  if (!manteveInicio && dataInicio < hoje()) {
    throw regra('DATA_PASSADA', 'A reserva não pode começar em uma data que já passou.');
  }
  if (dataInicio > somarDias(hoje(), MAX_DIAS_ANTECEDENCIA)) {
    throw regra('ANTECEDENCIA_EXCEDIDA', `A reserva pode ser feita com até ${MAX_DIAS_ANTECEDENCIA} dias de antecedência.`);
  }

  const dias = contarDias(dataInicio, dataFim);
  if (dias > MAX_DIAS_RESERVA) {
    throw regra('PERIODO_EXCEDIDO', `A reserva pode ter no máximo ${MAX_DIAS_RESERVA} dias.`);
  }

  const conflito = await reservaRepository.buscarConflito(
    { maquinaId, dataInicio, dataFim, ignorarId: reservaAtual?.id },
    tx,
  );
  if (conflito) {
    const inicio = formatarBr(dataParaTexto(conflito.dataInicio));
    const fim = formatarBr(dataParaTexto(conflito.dataFim));
    throw regra('RESERVA_SOBREPOSTA', `A máquina já está reservada de ${inicio} a ${fim}. Escolha outro período.`);
  }

  return {
    ...dados,
    dataInicio: textoParaData(dataInicio),
    dataFim: textoParaData(dataFim),
    valorTotal: maquina.valorDiaria.mul(dias),
  };
}

export const reservaService = {
  listar({ escopo, status }, usuario) {
    if (escopo === 'todas' && !ehAdmin(usuario)) {
      throw acessoNegado('Somente administradores podem ver todas as reservas.');
    }
    return reservaRepository.listar({ usuarioId: escopo === 'todas' ? undefined : usuario.id, status });
  },

  buscar: (id, usuario) => buscarComPermissao(id, usuario),

  criar: (dados, usuario) =>
    reservaRepository.transacao(async (tx) => {
      const validados = await validarRegras(dados, tx);
      return reservaRepository.criar({ ...validados, usuarioId: usuario.id }, tx);
    }),

  atualizar: (id, dados, usuario) =>
    reservaRepository.transacao(async (tx) => {
      const atual = await buscarComPermissao(id, usuario, tx);
      if (atual.status === 'CANCELADA') {
        throw regra('RESERVA_CANCELADA', 'Uma reserva cancelada não pode ser alterada.');
      }
      exigirNaoIniciada(atual, usuario);
      const validados = await validarRegras(dados, tx, atual);
      return reservaRepository.atualizar(id, validados, tx);
    }),

  async cancelar(id, usuario) {
    const atual = await buscarComPermissao(id, usuario);
    if (atual.status === 'CANCELADA') throw regra('RESERVA_CANCELADA', 'Esta reserva já está cancelada.');
    exigirNaoIniciada(atual, usuario);
    return reservaRepository.atualizar(id, { status: 'CANCELADA' });
  },

  async excluir(id, usuario) {
    const atual = await buscarComPermissao(id, usuario);
    if (atual.status === 'ATIVA') exigirNaoIniciada(atual, usuario);
    await reservaRepository.excluir(id);
  },
};
