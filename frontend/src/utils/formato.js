export const CATEGORIAS = ['Trator', 'Colheitadeira', 'Plantadeira', 'Pulverizador', 'Implemento', 'Outro'];
export const STATUS_MAQUINA = { DISPONIVEL: 'Disponível', MANUTENCAO: 'Em manutenção', INATIVA: 'Inativa' };

export const moeda = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const dataBr = (texto) => texto.split('-').reverse().join('/');

// Datas sempre como texto AAAA-MM-DD, igual ao backend
export const hoje = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
const emMs = (texto) => Date.parse(`${texto}T00:00:00Z`);
export const somarDias = (texto, dias) => new Date(emMs(texto) + dias * 86400000).toISOString().slice(0, 10);
export const contarDias = (inicio, fim) => Math.round((emMs(fim) - emMs(inicio)) / 86400000) + 1;
export const diaDaSemana = (texto) =>
  new Intl.DateTimeFormat('pt-BR', { weekday: 'narrow', timeZone: 'UTC' }).format(new Date(emMs(texto)));
export const ocupacaoNoDia = (ocupacoes, dia) => ocupacoes.find((o) => o.dataInicio <= dia && dia <= o.dataFim);
