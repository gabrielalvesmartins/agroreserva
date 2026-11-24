import { z } from 'zod';

const texto = (rotulo, min, max) =>
  z
    .string({ error: `Preencha o campo ${rotulo}.` })
    .trim()
    .min(1, { error: `Preencha o campo ${rotulo}.`, abort: true })
    .min(min, `${rotulo}: use pelo menos ${min} caracteres.`)
    .max(max, `${rotulo}: use no máximo ${max} caracteres.`);

const email = z
  .string({ error: 'Informe o e-mail.' })
  .trim()
  .toLowerCase()
  .max(150, 'E-mail deve ter no máximo 150 caracteres.')
  .pipe(z.email('Informe um e-mail válido.'));

// O bcrypt considera apenas os primeiros 72 bytes
const senhaNova = z
  .string({ error: 'Informe a senha.' })
  .min(8, 'A senha deve ter pelo menos 8 caracteres.')
  .refine((s) => Buffer.byteLength(s) <= 72, 'A senha é longa demais (máximo de 72 bytes).');

const data = (rotulo) =>
  z.string({ error: `Informe a ${rotulo}.` }).pipe(z.iso.date(`Informe uma ${rotulo} válida (AAAA-MM-DD).`));

const id = (mensagem) =>
  z.coerce.number({ error: mensagem }).int(mensagem).positive(mensagem).max(2147483647, mensagem);

const CATEGORIAS = ['Trator', 'Colheitadeira', 'Plantadeira', 'Pulverizador', 'Implemento', 'Outro'];
const STATUS_MAQUINA = ['DISPONIVEL', 'MANUTENCAO', 'INATIVA'];

export const parametroId = z.object({ id: id('Identificador inválido.') });

export const cadastroSchema = z.object({ nome: texto('Nome', 3, 100), email, senha: senhaNova });

export const loginSchema = z.object({
  email,
  senha: z.string({ error: 'Informe a senha.' }).min(1, 'Informe a senha.'),
});

export const maquinaSchema = z.object({
  codigo: texto('Código', 2, 20).toUpperCase(),
  nome: texto('Nome', 3, 100),
  categoria: z.enum(CATEGORIAS, { error: 'Selecione uma categoria válida.' }),
  marca: texto('Marca', 2, 60),
  ano: z
    .number({ error: 'Informe o ano em números.' })
    .int('O ano deve ser um número inteiro.')
    .min(1950, 'O ano deve ser a partir de 1950.')
    .refine((a) => a <= new Date().getFullYear() + 1, 'O ano não pode estar no futuro.'),
  valorDiaria: z
    .number({ error: 'Informe o valor da diária em números.' })
    .positive('O valor da diária deve ser maior que zero.')
    .max(999999.99, 'Valor da diária muito alto.')
    .refine((v) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-6, 'Use no máximo duas casas decimais.'),
  descricao: z
    .string({ error: 'A descrição deve ser um texto.' })
    .trim()
    .max(500, 'A descrição deve ter no máximo 500 caracteres.')
    .nullish()
    .transform((v) => v || null),
  status: z.enum(STATUS_MAQUINA, { error: 'Selecione uma situação válida.' }),
});

export const filtroMaquinasSchema = z.object({
  busca: z.string().trim().max(100, 'Busca muito longa.').optional(),
  categoria: z.enum(CATEGORIAS, { error: 'Categoria inválida.' }).optional(),
  status: z.enum(STATUS_MAQUINA, { error: 'Situação inválida.' }).optional(),
});

export const reservaSchema = z
  .object({
    maquinaId: id('Selecione uma máquina.'),
    dataInicio: data('data de início'),
    dataFim: data('data de término'),
    propriedade: texto('Local de uso', 3, 120),
    finalidade: texto('Finalidade', 3, 300),
  })
  .refine((r) => r.dataFim >= r.dataInicio, {
    path: ['dataFim'],
    message: 'A data de término não pode ser anterior à data de início.',
  });

export const filtroReservasSchema = z.object({
  escopo: z.enum(['minhas', 'todas'], { error: 'Escopo inválido.' }).default('minhas'),
  status: z.enum(['ATIVA', 'CANCELADA'], { error: 'Situação inválida.' }).optional(),
});
