import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { usuarioRepository } from '../repositories/usuario.repository.js';
import { AppError } from '../utils/AppError.js';
import { usuarioJson } from '../utils/apresentacao.js';

const CUSTO_HASH = 10;
// Usado quando o e-mail não existe, para a resposta levar o mesmo tempo.
const HASH_FICTICIO = bcrypt.hashSync('usuario-inexistente', CUSTO_HASH);

function criarSessao(usuario) {
  const token = jwt.sign({}, env.jwtSecret, {
    subject: String(usuario.id),
    expiresIn: env.jwtExpiresIn,
    algorithm: 'HS256',
  });
  return { token, usuario: usuarioJson(usuario) };
}

export const authService = {
  async cadastrar({ nome, email, senha }) {
    if (await usuarioRepository.buscarPorEmail(email)) {
      const mensagem = 'Este e-mail já está cadastrado.';
      throw new AppError(409, 'EMAIL_EM_USO', mensagem, [{ campo: 'email', mensagem }]);
    }
    const senhaHash = await bcrypt.hash(senha, CUSTO_HASH);
    // O perfil nunca vem da requisição: todo cadastro público é PRODUTOR.
    const usuario = await usuarioRepository.criar({ nome, email, senhaHash, perfil: 'PRODUTOR' });
    return criarSessao(usuario);
  },

  async entrar({ email, senha }) {
    const usuario = await usuarioRepository.buscarPorEmail(email);
    const senhaCorreta = await bcrypt.compare(senha, usuario?.senhaHash ?? HASH_FICTICIO);
    if (!usuario || !senhaCorreta) {
      throw new AppError(401, 'CREDENCIAIS_INVALIDAS', 'E-mail ou senha incorretos.');
    }
    return criarSessao(usuario);
  },
};
