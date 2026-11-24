// Único lugar do frontend que conversa com a API.
const URL_API = (import.meta.env.VITE_API_URL || 'http://localhost:3333/api').replace(/\/$/, '');
const CHAVE_TOKEN = 'agroreserva.token';
const TEMPO_LIMITE_MS = 75000; // o plano gratuito do Render pode levar cerca de 1 minuto para acordar

export class ErroApi extends Error {
  constructor(status, codigo, mensagem, detalhes = []) {
    super(mensagem);
    this.status = status;
    this.codigo = codigo;
    // [{ campo, mensagem }] vira { campo: mensagem } para mostrar ao lado de cada campo
    this.campos = Object.fromEntries(detalhes.map((d) => [d.campo, d.mensagem]));
  }
}

export const sessao = {
  token: () => localStorage.getItem(CHAVE_TOKEN),
  salvar: (token) => localStorage.setItem(CHAVE_TOKEN, token),
  limpar: () => localStorage.removeItem(CHAVE_TOKEN),
};

// O AuthContext registra aqui o que fazer quando a API recusar o token.
let aoPerderSessao = () => {};
export const definirAoPerderSessao = (funcao) => (aoPerderSessao = funcao);

async function requisitar(metodo, caminho, corpo) {
  const token = sessao.token();
  let resposta;
  let dados;
  try {
    resposta = await fetch(URL_API + caminho, {
      method: metodo,
      headers: {
        ...(corpo && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: corpo && JSON.stringify(corpo),
      signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
    });
    if (resposta.status === 204) return null;
    dados = await resposta.json();
  } catch {
    throw new ErroApi(0, 'FALHA_COMUNICACAO', 'Não foi possível falar com o servidor. Verifique a conexão e tente novamente.');
  }
  if (resposta.ok) return dados;

  const { codigo, mensagem, detalhes } = dados.erro ?? {};
  const erro = new ErroApi(resposta.status, codigo, mensagem ?? 'Ocorreu um erro inesperado.', detalhes);
  // Só encerra a sessão se o token recusado ainda for o atual
  if (resposta.status === 401 && token && token === sessao.token()) aoPerderSessao(erro.message);
  throw erro;
}

const consulta = (filtros) => {
  const preenchidos = Object.entries(filtros).filter(([, valor]) => valor);
  return preenchidos.length ? `?${new URLSearchParams(preenchidos)}` : '';
};

export const api = {
  cadastrar: (dados) => requisitar('POST', '/auth/cadastro', dados),
  entrar: (dados) => requisitar('POST', '/auth/login', dados),
  eu: () => requisitar('GET', '/auth/eu'),

  listarMaquinas: (filtros = {}) => requisitar('GET', `/maquinas${consulta(filtros)}`),
  criarMaquina: (dados) => requisitar('POST', '/maquinas', dados),
  atualizarMaquina: (id, dados) => requisitar('PUT', `/maquinas/${id}`, dados),
  excluirMaquina: (id) => requisitar('DELETE', `/maquinas/${id}`),

  listarReservas: (filtros = {}) => requisitar('GET', `/reservas${consulta(filtros)}`),
  criarReserva: (dados) => requisitar('POST', '/reservas', dados),
  atualizarReserva: (id, dados) => requisitar('PUT', `/reservas/${id}`, dados),
  cancelarReserva: (id) => requisitar('PATCH', `/reservas/${id}/cancelar`),
  excluirReserva: (id) => requisitar('DELETE', `/reservas/${id}`),
};
