import { AppError } from '../utils/AppError.js';

export function rotaNaoEncontrada(req, _res) {
  throw new AppError(404, 'ROTA_NAO_ENCONTRADA', `Rota ${req.method} ${req.path} não existe.`);
}

const BANCO_FORA = ['P1001', 'P1002', 'P1017', 'ECONNREFUSED'];

// Converte erros conhecidos de bibliotecas em AppError.
function traduzir(erro) {
  if (erro instanceof AppError) return erro;
  if (erro.type === 'entity.parse.failed') return new AppError(400, 'JSON_INVALIDO', 'O corpo da requisição não é um JSON válido.');
  if (erro.type === 'entity.too.large') return new AppError(413, 'CORPO_GRANDE', 'O corpo da requisição é grande demais.');
  if (erro.code === 'P2002') return new AppError(409, 'REGISTRO_DUPLICADO', 'Já existe um registro com este valor único.');
  if (erro.code === 'P2003') return new AppError(409, 'REGISTRO_EM_USO', 'O registro está vinculado a outros dados.');
  if (erro.code === 'P2025') return new AppError(404, 'NAO_ENCONTRADO', 'Registro não encontrado.');
  if (BANCO_FORA.includes(erro.code)) {
    return new AppError(503, 'BANCO_INDISPONIVEL', 'Banco de dados indisponível. Tente novamente em instantes.');
  }
  return null;
}

// O Express reconhece este middleware como tratador de erros por ter 4 parâmetros.
export function tratarErros(erro, _req, res, _next) {
  const conhecido = traduzir(erro);
  if (!conhecido) console.error(erro); // o detalhe técnico fica só no servidor
  const resposta =
    conhecido ?? new AppError(500, 'ERRO_INTERNO', 'Erro interno. Tente novamente mais tarde.');
  res.status(resposta.status).json({
    erro: { codigo: resposta.codigo, mensagem: resposta.message, detalhes: resposta.detalhes },
  });
}
