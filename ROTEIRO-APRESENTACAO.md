# Roteiro de apresentação e estudo

O professor pode pedir para explicar qualquer trecho. Leia os arquivos indicados antes da apresentação.

## AV1: backend, no Postman

Importe `postman/AgroReserva.postman_collection.json`, preencha as variáveis `adminEmail` e `adminSenha` da coleção (valores do seu `.env`) e execute na ordem. Cada pasta mostra um critério:

1. **Autenticação:** cadastro, login, senha errada (401), JWT.
2. **CRUD de máquinas** como administrador. Para provar a persistência, reinicie a API e consulte de novo.
3. **Regra de negócio:** reserva aceita (201) e reserva sobreposta (409).
4. **Proteção:** sem token (401), produtor tentando criar máquina (403), reserva de outra pessoa (403).
5. **Validação:** campos vazios (400).

## AV2: pela aplicação publicada

1. Contexto: problema, público e solução (início do README).
2. Cadastre-se como produtor. Mostre antes uma senha curta, para ver o erro no campo.
3. Reserve uma máquina clicando em um dia livre. O dia fica amarelo.
4. Tente reservar o mesmo período: aparece a mensagem da regra.
5. Edite, cancele e exclua uma reserva.
6. Abra `/admin/reservas` como produtor: acesso negado.
7. Saia e entre como administrador: cadastre, edite e exclua uma máquina; tente excluir uma com reservas.
8. Sessão inválida: em F12 > Application > Local Storage, altere o token e mude de página.
9. Falha de comunicação: em F12 > Network, escolha Offline e recarregue a lista pelo filtro.

## Perguntas prováveis

**Por que MVC?** Rotas definem o endereço, controllers tratam a requisição e a resposta, services têm as regras, repositories acessam o banco (Model) e o JSON é a View.

**Como a sobreposição é detectada?** Em `backend/src/repositories/reserva.repository.js`, `buscarConflito`: há conflito se a reserva existente começa até o fim da nova **e** termina a partir do início da nova. Ao editar, a própria reserva é ignorada. Canceladas não contam.

**E se duas pessoas reservarem ao mesmo tempo?** `maquinaRepository.travar` usa `SELECT ... FOR UPDATE` na transação. A segunda espera a primeira terminar e então encontra o conflito.

**O que é o hash?** Transformação de mão única. O `bcrypt.compare` compara a senha digitada com o hash; a senha original não é salva.

**O que há no JWT?** O id do usuário (`sub`), a emissão e a expiração, assinados com `JWT_SECRET`. Ele é assinado, não criptografado. O perfil é lido do banco a cada requisição.

**Diferença entre 401 e 403?** 401: não sei quem você é. 403: sei quem você é, mas você não pode fazer isso.

**Por que proteger também no React?** Só para a navegação. Quem usa o Postman ignora o React, então a segurança real está na API.

**Por que 409 na regra?** Os dados têm formato válido, mas entram em conflito com o estado atual do sistema.

**Para que serve o `useEffect` em `useConsulta`?** Refaz a busca quando os filtros mudam e descarta respostas antigas.

**Como o frontend percebe sessão expirada?** `services/api.js` recebe 401, chama `aoPerderSessao`, o AuthContext apaga o token e a rota protegida leva ao login.

**Como o Tailwind foi usado?** Classes nos componentes e cores e fontes do projeto no `@theme` de `frontend/src/index.css`. Prefixos `sm:`, `md:` e `lg:` fazem a responsividade.

**O que é CORS?** O navegador só deixa o site chamar a API em outro domínio se ela autorizar; `CORS_ORIGIN` lista os sites autorizados.

**Por que o adapter no Prisma?** No Prisma 7, a conexão usa um driver adapter; aqui, `@prisma/adapter-pg`.
