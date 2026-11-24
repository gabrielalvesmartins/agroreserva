import { prisma } from '../config/prisma.js';
import { hoje, textoParaData } from '../utils/datas.js';

const comOcupacoes = () => ({
  reservas: {
    where: { status: 'ATIVA', dataFim: { gte: textoParaData(hoje()) } },
    orderBy: { dataInicio: 'asc' },
  },
});

// O parâmetro "db" permite usar a transação (tx) no lugar do cliente padrão.
export const maquinaRepository = {
  listar({ busca, categoria, status }) {
    return prisma.maquina.findMany({
      where: {
        categoria,
        status,
        ...(busca && {
          OR: ['nome', 'codigo', 'marca'].map((campo) => ({ [campo]: { contains: busca, mode: 'insensitive' } })),
        }),
      },
      include: comOcupacoes(),
      orderBy: { codigo: 'asc' },
    });
  },
  buscarPorId: (id, db = prisma) => db.maquina.findUnique({ where: { id }, include: comOcupacoes() }),
  criar: (dados) => prisma.maquina.create({ data: dados }),
  atualizar: (id, dados, db = prisma) => db.maquina.update({ where: { id }, data: dados, include: comOcupacoes() }),
  excluir: (id, db = prisma) => db.maquina.delete({ where: { id } }),
  contarReservas: (id, db = prisma) => db.reserva.count({ where: { maquinaId: id } }),

  // Trava a linha da máquina até o fim da transação: duas reservas simultâneas
  // da mesma máquina são avaliadas uma por vez.
  travar: (id, tx) => tx.$queryRaw`SELECT id FROM maquinas WHERE id = ${id} FOR UPDATE`,
};
