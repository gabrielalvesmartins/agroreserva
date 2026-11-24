// Testes de integração: exigem banco migrado e com seed (npm run build).
// Só rodam em banco local e apagam o que criam.
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env.js';

assert.ok(['localhost', '127.0.0.1'].includes(new URL(env.databaseUrl).hostname), 'Use somente banco local nos testes.');

const { app } = await import('../src/app.js');
const { prisma } = await import('../src/config/prisma.js');
const { hoje, somarDias } = await import('../src/utils/datas.js');

const sufixo = Date.now();
const dia = (n) => somarDias(hoje(), n);
let servidor, base, admin, ana, beto, maquina;

async function api(metodo, rota, { token, corpo } = {}) {
  const r = await fetch(base + rota, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: corpo === undefined ? undefined : typeof corpo === 'string' ? corpo : JSON.stringify(corpo),
  });
  return { status: r.status, dados: r.status === 204 ? null : await r.json() };
}

const cadastrar = (nome) =>
  api('POST', '/auth/cadastro', { corpo: { nome, email: `${nome}-${sufixo}@teste.test`, senha: 'senha-teste-1', perfil: 'ADMIN' } });
const corpoMaquina = (extra) => ({ codigo: `T${sufixo}`, nome: 'Trator teste', categoria: 'Trator', marca: 'Teste', ano: 2020, valorDiaria: 100.5, status: 'DISPONIVEL', ...extra });
const corpoReserva = (inicio, fim, extra) => ({ maquinaId: maquina.id, dataInicio: dia(inicio), dataFim: dia(fim), propriedade: 'Sítio Teste', finalidade: 'Plantio de milho', ...extra });
const reservar = (quem, ...args) => api('POST', '/reservas', { token: quem.token, corpo: corpoReserva(...args) });

before(async () => {
  await new Promise((ok) => (servidor = app.listen(0, ok)));
  base = `http://localhost:${servidor.address().port}/api`;
  const login = await api('POST', '/auth/login', { corpo: { email: process.env.ADMIN_EMAIL, senha: process.env.ADMIN_PASSWORD } });
  assert.equal(login.status, 200);
  admin = login.dados;
  ana = (await cadastrar('ana')).dados;
  beto = (await cadastrar('beto')).dados;
  const m = await api('POST', '/maquinas', { token: admin.token, corpo: corpoMaquina() });
  assert.equal(m.status, 201);
  maquina = m.dados;
});

after(async () => {
  const usuarios = { email: { endsWith: `-${sufixo}@teste.test` } };
  await prisma.reserva.deleteMany({ where: { maquina: { codigo: { startsWith: `T${sufixo}` } } } });
  await prisma.maquina.deleteMany({ where: { codigo: { startsWith: `T${sufixo}` } } });
  await prisma.usuario.deleteMany({ where: usuarios });
  await prisma.$disconnect();
  servidor.close();
});

test('cadastro: perfil não pode ser escolhido, senha vira hash, e-mail é único', async () => {
  assert.equal(ana.usuario.perfil, 'PRODUTOR');
  assert.equal(ana.usuario.senhaHash, undefined);
  const salvo = await prisma.usuario.findUnique({ where: { id: ana.usuario.id } });
  assert.match(salvo.senhaHash, /^\$2[aby]\$10\$/);
  assert.equal((await cadastrar('ana')).status, 409);
});

test('login: senha errada e e-mail inexistente dão 401', async () => {
  assert.equal((await api('POST', '/auth/login', { corpo: { email: ana.usuario.email, senha: 'errada' } })).status, 401);
  assert.equal((await api('POST', '/auth/login', { corpo: { email: 'nao@existe.test', senha: 'errada' } })).status, 401);
});

test('JWT: ausente, inválido, expirado e válido', async () => {
  assert.equal((await api('GET', '/maquinas')).dados.erro.codigo, 'TOKEN_AUSENTE');
  assert.equal((await api('GET', '/maquinas', { token: 'abc' })).dados.erro.codigo, 'TOKEN_INVALIDO');
  const velho = jwt.sign({}, env.jwtSecret, { subject: String(ana.usuario.id), expiresIn: -1 });
  const r = await api('GET', '/maquinas', { token: velho });
  assert.equal(r.status, 401);
  assert.equal(r.dados.erro.codigo, 'TOKEN_EXPIRADO');
  assert.equal((await api('GET', '/auth/eu', { token: ana.token })).dados.id, ana.usuario.id);
});

test('máquinas: produtor consulta, mas não cria, altera nem exclui (403)', async () => {
  assert.equal((await api('GET', '/maquinas', { token: ana.token })).status, 200);
  assert.equal((await api('POST', '/maquinas', { token: ana.token, corpo: corpoMaquina() })).status, 403);
  assert.equal((await api('PUT', `/maquinas/${maquina.id}`, { token: ana.token, corpo: corpoMaquina() })).status, 403);
  assert.equal((await api('DELETE', `/maquinas/${maquina.id}`, { token: ana.token })).status, 403);
});

test('máquinas: CRUD do administrador e código único', async () => {
  const token = admin.token;
  const criada = await api('POST', '/maquinas', { token, corpo: corpoMaquina({ codigo: `T${sufixo}B` }) });
  const rota = `/maquinas/${criada.dados.id}`;
  const alterada = await api('PUT', rota, { token, corpo: corpoMaquina({ codigo: `T${sufixo}B`, nome: 'Novo nome' }) });
  assert.equal(alterada.dados.nome, 'Novo nome');
  assert.equal((await api('GET', rota, { token })).dados.nome, 'Novo nome');
  assert.equal((await api('PUT', rota, { token, corpo: corpoMaquina() })).dados.erro.codigo, 'CODIGO_EM_USO');
  assert.equal((await api('DELETE', rota, { token })).status, 204);
  assert.equal((await api('GET', rota, { token })).status, 404);
});

test('validações: 400 com o campo, JSON inválido, rota inexistente', async () => {
  const r = await api('POST', '/maquinas', { token: admin.token, corpo: {} });
  assert.equal(r.status, 400);
  assert.ok(r.dados.erro.detalhes.some((d) => d.campo === 'codigo'));
  assert.equal((await reservar(ana, 5, 3)).dados.erro.detalhes[0].campo, 'dataFim');
  assert.equal((await reservar(ana, 1, 1, { dataInicio: '2026-02-31' })).status, 400);
  assert.equal((await api('GET', '/maquinas/abc', { token: ana.token })).status, 400);
  assert.equal((await api('POST', '/auth/login', { corpo: '{x' })).dados.erro.codigo, 'JSON_INVALIDO');
  assert.equal((await api('GET', '/nada')).status, 404);
});

test('reserva: CRUD completo e valor calculado pelo backend', async () => {
  const token = ana.token;
  const criada = await reservar(ana, 2, 4, { valorTotal: 1 });
  assert.equal(criada.status, 201);
  assert.equal(criada.dados.valorTotal, 301.5);
  assert.equal(criada.dados.dataInicio, dia(2));
  const rota = `/reservas/${criada.dados.id}`;
  assert.equal((await api('PUT', rota, { token, corpo: corpoReserva(2, 3) })).dados.valorTotal, 201);
  assert.equal((await api('GET', rota, { token })).dados.dataFim, dia(3));
  assert.equal((await api('DELETE', rota, { token })).status, 204);
  assert.equal((await api('GET', rota, { token })).status, 404);
});

test('REGRA: bloqueia sobreposição, aceita período livre, cancelada libera', async () => {
  const primeira = await reservar(ana, 10, 14);
  assert.equal(primeira.status, 201);
  for (const [i, f] of [[10, 14], [8, 10], [14, 16], [11, 12], [8, 20]]) {
    const r = await reservar(beto, i, f);
    assert.equal(r.status, 409);
    assert.equal(r.dados.erro.codigo, 'RESERVA_SOBREPOSTA');
  }
  const segunda = await reservar(beto, 15, 16);
  assert.equal(segunda.status, 201);
  const mover = await api('PUT', `/reservas/${segunda.dados.id}`, { token: beto.token, corpo: corpoReserva(14, 16) });
  assert.equal(mover.dados.erro.codigo, 'RESERVA_SOBREPOSTA');
  assert.equal((await api('PATCH', `/reservas/${primeira.dados.id}/cancelar`, { token: ana.token })).dados.status, 'CANCELADA');
  assert.equal((await reservar(beto, 10, 14)).status, 201);
});

test('REGRA: dez pedidos simultâneos geram uma única reserva', async () => {
  const r = await Promise.all(Array.from({ length: 10 }, () => reservar(ana, 40, 42)));
  assert.equal(r.filter((x) => x.status === 201).length, 1);
  assert.equal(r.filter((x) => x.status === 409).length, 9);
});

test('regras: data passada, 30 dias, antecedência, reserva iniciada e máquina indisponível', async () => {
  assert.equal((await reservar(ana, -1, 1)).dados.erro.codigo, 'DATA_PASSADA');
  assert.equal((await reservar(ana, 60, 90)).dados.erro.codigo, 'PERIODO_EXCEDIDO');
  assert.equal((await reservar(ana, 366, 367)).dados.erro.codigo, 'ANTECEDENCIA_EXCEDIDA');
  const deHoje = await reservar(ana, 0, 0);
  assert.equal((await api('DELETE', `/reservas/${deHoje.dados.id}`, { token: ana.token })).dados.erro.codigo, 'RESERVA_INICIADA');
  assert.equal((await api('DELETE', `/reservas/${deHoje.dados.id}`, { token: admin.token })).status, 204);
  const parada = await api('POST', '/maquinas', { token: admin.token, corpo: corpoMaquina({ codigo: `T${sufixo}C`, status: 'MANUTENCAO' }) });
  assert.equal((await reservar(ana, 1, 1, { maquinaId: parada.dados.id })).dados.erro.codigo, 'MAQUINA_INDISPONIVEL');
});

test('autorização: usuário não acessa reserva alheia; administrador acessa', async () => {
  const rota = `/reservas/${(await reservar(ana, 100, 101)).dados.id}`;
  assert.equal((await api('GET', rota, { token: beto.token })).status, 403);
  assert.equal((await api('PUT', rota, { token: beto.token, corpo: corpoReserva(102, 103) })).status, 403);
  assert.equal((await api('PATCH', `${rota}/cancelar`, { token: beto.token })).status, 403);
  assert.equal((await api('DELETE', rota, { token: beto.token })).status, 403);
  assert.equal((await api('GET', rota, { token: admin.token })).status, 200);
  assert.equal((await api('GET', '/reservas?escopo=todas', { token: beto.token })).status, 403);
  assert.equal((await api('GET', '/reservas?escopo=todas', { token: admin.token })).status, 200);
  const minhas = await api('GET', '/reservas', { token: beto.token });
  assert.ok(minhas.dados.every((r) => r.usuarioId === beto.usuario.id));
});

test('máquina com reservas não é excluída nem retirada de operação', async () => {
  const token = admin.token;
  assert.equal((await api('DELETE', `/maquinas/${maquina.id}`, { token })).dados.erro.codigo, 'MAQUINA_COM_HISTORICO');
  const r = await api('PUT', `/maquinas/${maquina.id}`, { token, corpo: corpoMaquina({ status: 'INATIVA' }) });
  assert.equal(r.dados.erro.codigo, 'MAQUINA_COM_RESERVAS');
});
