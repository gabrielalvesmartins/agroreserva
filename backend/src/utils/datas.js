// As reservas usam dias inteiros. Trabalhamos com texto AAAA-MM-DD para evitar
// que o fuso horário do servidor mude o dia.
const DIA_MS = 24 * 60 * 60 * 1000;

export const textoParaData = (texto) => new Date(`${texto}T00:00:00.000Z`);
export const dataParaTexto = (data) => data.toISOString().slice(0, 10);

// en-CA formata como AAAA-MM-DD
export const hoje = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());

export const somarDias = (texto, dias) =>
  dataParaTexto(new Date(textoParaData(texto).getTime() + dias * DIA_MS));

// O primeiro e o último dia contam: 10 a 12 são 3 diárias.
export const contarDias = (inicio, fim) =>
  Math.round((textoParaData(fim) - textoParaData(inicio)) / DIA_MS) + 1;

export const formatarBr = (texto) => texto.split('-').reverse().join('/');
