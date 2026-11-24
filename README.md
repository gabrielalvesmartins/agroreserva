# AgroReserva: reserva de maquinários agrícolas

Projeto de DSW (AV1 e AV2, 4º bimestre).

| | Endereço |
|---|---|
| Aplicação publicada | _preencher após o deploy na Vercel_ |
| API publicada | _preencher após o deploy no Render_ |

## Problema, público e solução

Associações e cooperativas rurais compartilham máquinas caras. Quando a agenda é combinada por mensagem ou caderno, dois produtores podem contar com a mesma máquina no mesmo dia. O AgroReserva mostra a agenda de cada máquina, permite reservar um período e impede conflitos.

**Público-alvo:** produtores rurais e administradores de cooperativas, associações ou locadoras de máquinas.

## Tecnologias e versões

| Parte | Tecnologias |
|---|---|
| Backend | Node.js 24, Express 5.3.0 (MVC), Prisma ORM 7.10.0 (`prisma`, `@prisma/client`, `@prisma/adapter-pg`), PostgreSQL, JWT (`jsonwebtoken` 9.0.3), hash com `bcryptjs` 3.0.3, validação com `zod` 4.6.7 |
| Frontend | React 19.3.1, Vite 7.3.8, React Router 8.5.3, Tailwind CSS 4.3.0 (`tailwindcss` e `@tailwindcss/vite`) |

## Estrutura

```text
backend/
  prisma/            schema, migrations e seed
  src/routes/        endereços da API e middlewares de cada rota
  src/controllers/   recebem a requisição e devolvem a resposta
  src/services/      regras de negócio e autorização por dono
  src/repositories/  acesso aos dados com Prisma (Model)
  src/middlewares/   JWT, perfil, validação e erros
  src/validators/    formatos e campos obrigatórios
  src/utils/apresentacao.js   formato do JSON (View da API)
  tests/             testes de integração
frontend/src/
  services/api.js    todas as chamadas à API
  contexts/          sessão do usuário e avisos
  components/        botões, campos, modais, formulários, rotas protegidas
  pages/             login/cadastro, máquinas e reservas
postman/             coleção para demonstrar a API
```

## Modelagem do banco

- `usuarios` 1:N `reservas`
- `maquinas` 1:N `reservas`

`usuarios` guarda nome, e-mail único, hash da senha e perfil. `maquinas` guarda código único, nome, categoria, marca, ano, diária, descrição e situação. `reservas` liga usuário e máquina e guarda período, local, finalidade, valor e situação.

## Regras de negócio

1. **Principal:** uma máquina não pode ter duas reservas ativas com dias em comum. O primeiro e o último dia contam. A verificação roda em uma transação que trava a linha da máquina, então funciona também com pedidos simultâneos.
2. Máquina em manutenção ou inativa não pode ser reservada.
3. A reserva não começa no passado, tem no máximo 30 dias e até 365 dias de antecedência.
4. Após o início, somente o administrador altera, cancela ou exclui uma reserva ativa.
5. Máquina com reservas não é excluída; com reservas vigentes ou futuras, não sai de operação.
6. O valor total é calculado no backend: diárias × valor da diária.

## Permissões

| Operação | Visitante | Produtor | Administrador |
|---|---|---|---|
| Cadastro e login | sim | sim | sim |
| Consultar máquinas e agenda | não | sim | sim |
| Criar, alterar e excluir máquinas | não | não | sim |
| Criar reserva | não | sim | sim |
| Consultar, alterar, cancelar e excluir reserva | não | só as próprias | todas |

O cadastro público sempre cria um Produtor. O Administrador é criado pelo seed.

## Executar localmente

Requisito: [Node.js 24](https://nodejs.org). Há um PostgreSQL local de desenvolvimento incluído nas dependências; quem já tem PostgreSQL pode usar o seu.

### Backend

1. Entre na pasta `backend` e instale: `npm install`
2. Copie `.env.example` para `.env` e preencha. Exemplo de formato do banco: `postgresql://USUARIO:SENHA@localhost:54329/agroreserva`
3. Em um terminal separado, inicie o banco local e deixe aberto: `npm run db:local`
4. Gere o cliente Prisma, aplique as migrations e rode o seed: `npm run build`
5. Inicie a API: `npm run dev` (em `http://localhost:3333/api`)

Testes, com o banco local ligado: `npm test`

### Frontend

1. Entre na pasta `frontend` e instale: `npm install`
2. Copie `.env.example` para `.env`
3. Inicie: `npm run dev` e abra `http://localhost:5173`

## Variáveis de ambiente

| Onde | Variável | Para que serve |
|---|---|---|
| Backend | `DATABASE_URL` | conexão com o PostgreSQL |
| Backend | `JWT_SECRET` | segredo do JWT, mínimo de 32 caracteres |
| Backend | `JWT_EXPIRES_IN` | duração da sessão (ex.: `2h`) |
| Backend | `PORT` | porta (o Render define sozinho) |
| Backend | `CORS_ORIGIN` | endereço do frontend autorizado |
| Backend | `ADMIN_NOME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | administrador criado pelo seed |
| Frontend | `VITE_API_URL` | endereço público da API, terminando em `/api` |

## Principais rotas

Todas começam com `/api`. Exceto cadastro, login e saúde, exigem `Authorization: Bearer TOKEN`.

| Método e rota | Descrição | Acesso |
|---|---|---|
| `POST /auth/cadastro` | cria usuário e devolve JWT | público |
| `POST /auth/login` | valida a senha e devolve JWT | público |
| `GET /auth/eu` | usuário da sessão | autenticado |
| `GET /maquinas` | lista; filtros `busca`, `categoria`, `status` | autenticado |
| `GET /maquinas/:id` | consulta uma máquina | autenticado |
| `POST /maquinas` | cadastra | administrador |
| `PUT /maquinas/:id` | altera | administrador |
| `DELETE /maquinas/:id` | exclui | administrador |
| `GET /reservas` | minhas reservas; `?escopo=todas` só administrador | autenticado |
| `GET /reservas/:id` | consulta uma reserva | dono ou administrador |
| `POST /reservas` | cria reserva | autenticado |
| `PUT /reservas/:id` | altera | dono ou administrador |
| `PATCH /reservas/:id/cancelar` | cancela | dono ou administrador |
| `DELETE /reservas/:id` | exclui | dono ou administrador |
| `GET /saude` | verifica se a API está no ar | público |

Códigos usados: 200, 201, 204, 400 (dados inválidos), 401 (sem autenticação), 403 (sem permissão), 404 (não encontrado), 409 (regra de negócio ou duplicidade), 500 e 503.

## Publicação

1. **GitHub:** envie este projeto para um repositório acessível ao professor. `.env`, `.tools` e `node_modules` já são ignorados.
2. **Banco (Neon):** crie um projeto PostgreSQL e copie a conexão **direta** (sem pooler), com `sslmode=require`.
3. **Backend (Render):** New > Blueprint e selecione o repositório (usa o `render.yaml`). Informe `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` e `CORS_ORIGIN`. `JWT_SECRET` é gerado pelo Render. Como o endereço da Vercel ainda não existe, use temporariamente `http://localhost:5173` em `CORS_ORIGIN`.
4. **Frontend (Vercel):** importe o repositório, escolha `frontend` como Root Directory, framework Vite, e defina `VITE_API_URL` como `https://SEU-BACKEND.onrender.com/api`.
5. Volte ao Render, troque `CORS_ORIGIN` pelo endereço da Vercel (sem barra no final) e salve.
6. Teste o fluxo pela URL pública e preencha os endereços no início deste README.

No plano gratuito do Render, a API pode dormir. Abra o site alguns minutos antes da apresentação.

## Fontes dos componentes

- [Headless UI](https://headlessui.com) 2.2.10 (MIT, Tailwind Labs): base do modal, adaptada em `components/Modal.jsx`.
- [Heroicons](https://heroicons.com) 2.2.0 (MIT, Tailwind Labs): ícones.
- [Barlow e Barlow Condensed](https://fontsource.org/fonts/barlow) via Fontsource (SIL OFL 1.1): fontes.
- Os demais componentes foram feitos para este projeto com classes do Tailwind CSS, com apoio de ferramenta de IA (Claude).
