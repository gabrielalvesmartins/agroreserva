// PostgreSQL local para desenvolvimento, sem instalar nada no Windows.
// Deixe este terminal aberto enquanto usa a API. Em produção usa-se o banco publicado.
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';
import EmbeddedPostgres from 'embedded-postgres';

if (!process.env.DATABASE_URL) {
  console.error('Defina DATABASE_URL no .env antes de iniciar o banco local.');
  process.exit(1);
}
const url = new URL(process.env.DATABASE_URL);
if (!['localhost', '127.0.0.1'].includes(url.hostname)) {
  console.error('DATABASE_URL não aponta para localhost; nada foi iniciado.');
  process.exit(1);
}
const pasta = fileURLToPath(new URL('../.banco-local', import.meta.url));
const nome = url.pathname.slice(1);

const pg = new EmbeddedPostgres({
  databaseDir: pasta,
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  port: Number(url.port || 5432),
  persistent: true,
  initdbFlags: ['--encoding=UTF8', '--locale=C'],
  onLog: () => {},
});

if (!existsSync(`${pasta}/PG_VERSION`)) await pg.initialise();
await pg.start();
const cliente = pg.getPgClient();
await cliente.connect();
const { rowCount } = await cliente.query('SELECT 1 FROM pg_database WHERE datname = $1', [nome]);
await cliente.end();
if (!rowCount) await pg.createDatabase(nome);
console.log(`Banco local pronto na porta ${url.port || 5432}. Ctrl+C para encerrar.`);

process.on('SIGINT', async () => {
  await pg.stop();
  process.exit(0);
});
setInterval(() => {}, 1 << 30);
