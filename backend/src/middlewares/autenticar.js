import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { usuarioRepository } from '../repositories/usuario.repository.js';
import { AppError, acessoNegado } from '../utils/AppError.js';

const naoAutenticado = (codigo, mensagem) => new AppError(401, codigo, mensagem);

// Autenticação: quem é o usuário?
export async function autenticar(req, _res, next) {
  const [tipo, token] = (req.headers.authorization ?? '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    throw naoAutenticado('TOKEN_AUSENTE', 'Faça login para continuar.');
  }

  let conteudo;
  try {
    conteudo = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
  } catch (erro) {
    if (erro.name === 'TokenExpiredError') {
      throw naoAutenticado('TOKEN_EXPIRADO', 'Sua sessão expirou. Faça login novamente.');
    }
    throw naoAutenticado('TOKEN_INVALIDO', 'Sessão inválida. Faça login novamente.');
  }

  // O perfil vem do banco, e não do token, para valer sempre a permissão atual.
  const usuario = await usuarioRepository.buscarPorId(Number(conteudo.sub));
  if (!usuario) throw naoAutenticado('TOKEN_INVALIDO', 'Sessão inválida. Faça login novamente.');

  req.usuario = usuario;
  next();
}

// Autorização por perfil: o usuário pode fazer isto?
export const exigirPerfil = (...perfis) => (req, _res, next) => {
  if (!perfis.includes(req.usuario.perfil)) throw acessoNegado();
  next();
};
