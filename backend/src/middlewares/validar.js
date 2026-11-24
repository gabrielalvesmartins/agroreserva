import { AppError } from '../utils/AppError.js';

// Valida partes da requisição e guarda o resultado limpo em req.validado.
export const validar = (esquemas) => (req, _res, next) => {
  req.validado = {};
  for (const [parte, esquema] of Object.entries(esquemas)) {
    const resultado = esquema.safeParse(req[parte] ?? {});
    if (!resultado.success) {
      const detalhes = resultado.error.issues.map((i) => ({ campo: i.path.join('.'), mensagem: i.message }));
      throw new AppError(400, 'DADOS_INVALIDOS', 'Verifique os dados informados.', detalhes);
    }
    req.validado[parte] = resultado.data;
  }
  next();
};
