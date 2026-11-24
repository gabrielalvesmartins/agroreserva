import 'dotenv/config';

function obrigatoria(nome) {
  const valor = process.env[nome];
  if (!valor) throw new Error(`Variável de ambiente ${nome} não configurada. Veja o .env.example.`);
  return valor;
}

export const env = {
  databaseUrl: obrigatoria('DATABASE_URL'),
  jwtSecret: obrigatoria('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '2h',
  port: Number(process.env.PORT) || 3333,
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean),
};

if (env.jwtSecret.length < 32) {
  throw new Error('JWT_SECRET precisa ter no mínimo 32 caracteres.');
}
