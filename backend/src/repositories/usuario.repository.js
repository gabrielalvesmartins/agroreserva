import { prisma } from '../config/prisma.js';

export const usuarioRepository = {
  buscarPorId: (id) => prisma.usuario.findUnique({ where: { id } }),
  buscarPorEmail: (email) => prisma.usuario.findUnique({ where: { email } }),
  criar: (dados) => prisma.usuario.create({ data: dados }),
};
