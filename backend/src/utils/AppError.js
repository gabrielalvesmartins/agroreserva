// Erro esperado da aplicação: já carrega o código HTTP e a mensagem para o usuário.
export class AppError extends Error {
  constructor(status, codigo, mensagem, detalhes) {
    super(mensagem);
    this.status = status;
    this.codigo = codigo;
    this.detalhes = detalhes;
  }
}

export const naoEncontrado = (oQue) => new AppError(404, 'NAO_ENCONTRADO', `${oQue} não foi encontrada.`);
export const acessoNegado = (mensagem = 'Você não tem permissão para realizar esta operação.') =>
  new AppError(403, 'ACESSO_NEGADO', mensagem);
