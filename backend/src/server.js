import { app } from './app.js';
import { env } from './config/env.js';

app.listen(env.port, (erro) => {
  if (erro) throw erro;
  console.log(`API AgroReserva na porta ${env.port}`);
});
