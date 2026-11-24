import { prisma } from '../config/prisma.js';
import { textoParaData } from '../utils/datas.js';

const include = { maquina: true, usuario: true };

export const reservaRepository = {
  listar: ({ usuarioId, status }) =>
    prisma.reserva.findMany({
      where: { usuarioId, status },
      include,
      orderBy: [{ dataInicio: 'desc' }, { id: 'desc' }],
    }),
  buscarPorId: (id, db = prisma) => db.reserva.findUnique({ where: { id }, include }),
  criar: (dados, db = prisma) => db.reserva.create({ data: dados, include }),
  atualizar: (id, dados, db = prisma) => db.reserva.update({ where: { id }, data: dados, include }),
  excluir: (id) => prisma.reserva.delete({ where: { id } }),

  // Dois períodos se sobrepõem quando cada um começa antes (ou no dia) de o outro terminar.
  buscarConflito: ({ maquinaId, dataInicio, dataFim, ignorarId }, db = prisma) =>
    db.reserva.findFirst({
      where: {
        maquinaId,
        status: 'ATIVA',
        dataInicio: { lte: textoParaData(dataFim) },
        dataFim: { gte: textoParaData(dataInicio) },
        ...(ignorarId && { id: { not: ignorarId } }),
      },
      orderBy: { dataInicio: 'asc' },
    }),

  transacao: (funcao) => prisma.$transaction(funcao, { maxWait: 10000, timeout: 15000 }),
};
