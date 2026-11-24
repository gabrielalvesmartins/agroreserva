// Cria o administrador e algumas máquinas iniciais. Pode ser executado mais de uma vez.
import bcrypt from 'bcryptjs';
import { prisma } from '../src/config/prisma.js';

const { ADMIN_NOME = 'Administrador', ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
  throw new Error('Configure ADMIN_EMAIL e ADMIN_PASSWORD (mínimo de 8 caracteres) antes do seed.');
}

const email = ADMIN_EMAIL.trim().toLowerCase();
await prisma.usuario.upsert({
  where: { email },
  update: {},
  create: { nome: ADMIN_NOME, email, senhaHash: await bcrypt.hash(ADMIN_PASSWORD, 10), perfil: 'ADMIN' },
});

if ((await prisma.maquina.count()) === 0) {
  await prisma.maquina.createMany({
    data: [
      { codigo: 'TR-01', nome: 'Trator 6110J', categoria: 'Trator', marca: 'John Deere', ano: 2021, valorDiaria: 850, descricao: '110 cv, cabine fechada e tração 4x4.' },
      { codigo: 'TR-02', nome: 'Trator BM 125i', categoria: 'Trator', marca: 'Valtra', ano: 2019, valorDiaria: 780, descricao: '125 cv, indicado para preparo de solo.' },
      { codigo: 'CO-01', nome: 'Colheitadeira TC 5090', categoria: 'Colheitadeira', marca: 'New Holland', ano: 2020, valorDiaria: 3200, descricao: 'Plataforma de 25 pés para soja e milho.' },
      { codigo: 'PL-01', nome: 'Plantadeira 9 linhas', categoria: 'Plantadeira', marca: 'Tatu Marchesan', ano: 2022, valorDiaria: 640, descricao: 'Plantio direto com espaçamento de 45 cm.' },
      { codigo: 'PU-01', nome: 'Pulverizador Uniport 2030', categoria: 'Pulverizador', marca: 'Jacto', ano: 2018, valorDiaria: 1450, descricao: 'Autopropelido, tanque de 2.000 litros.', status: 'MANUTENCAO' },
      { codigo: 'IM-01', nome: 'Grade niveladora 32 discos', categoria: 'Implemento', marca: 'Baldan', ano: 2017, valorDiaria: 190, descricao: 'Necessita de trator a partir de 90 cv.' },
    ],
  });
}

console.log('Seed concluído.');
await prisma.$disconnect();
