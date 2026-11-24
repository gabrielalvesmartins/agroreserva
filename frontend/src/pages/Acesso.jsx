import { Link, useLocation } from 'react-router';
import { Botao } from '../components/Botao.jsx';
import { Campo } from '../components/Campo.jsx';
import { ErroFormulario } from '../components/ErroFormulario.jsx';
import { useFormulario } from '../components/useFormulario.js';
import { useAuth } from '../contexts/AuthContext.jsx';

const estiloLink = 'font-semibold text-mata-700 underline';

// Login e cadastro: depois do sucesso, a RotaPublica redireciona.
export function Acesso({ modo }) {
  const { entrar, cadastrar } = useAuth();
  const { state } = useLocation();
  const { campo, enviar, enviando, erroGeral } = useFormulario({ nome: '', email: '', senha: '' });
  const cadastro = modo === 'cadastro';

  const aoEnviar = enviar(({ nome, email, senha }) =>
    cadastro ? cadastrar({ nome, email, senha }) : entrar({ email, senha }),
  );

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="flex flex-col justify-between gap-8 bg-mata-900 p-6 text-white lg:p-12">
        <p className="font-titulo text-2xl font-bold">AgroReserva</p>
        <div className="max-w-lg">
          <h1 className="font-titulo text-4xl leading-none font-bold text-balance lg:text-6xl">
            A máquina certa, livre no dia certo.
          </h1>
          <p className="mt-4 text-lg text-mata-100">
            Consulte a agenda dos maquinários, escolha o período e reserve sem conflito com outros produtores.
          </p>
        </div>
        <div aria-hidden="true" className="hidden gap-1.5 lg:grid">
          {['col-start-2 col-span-4', 'col-start-6 col-span-5', 'col-start-1 col-span-3'].map((posicao) => (
            <div key={posicao} className="grid h-8 grid-cols-12 bg-mata-700">
              <span className={`bg-trator-400 ${posicao}`} />
            </div>
          ))}
        </div>
      </section>
      <section className="flex items-center justify-center p-6">
        <form onSubmit={aoEnviar} noValidate className="grid w-full max-w-sm gap-4">
          <h2 className="font-titulo text-3xl font-bold">{cadastro ? 'Criar conta' : 'Entrar'}</h2>
          <ErroFormulario mensagem={erroGeral} />
          {cadastro && <Campo rotulo="Nome" autoComplete="name" {...campo('nome')} />}
          <Campo rotulo="E-mail" type="email" autoComplete="email" {...campo('email')} />
          <Campo
            rotulo="Senha"
            type="password"
            autoComplete={cadastro ? 'new-password' : 'current-password'}
            ajuda={cadastro ? 'Use pelo menos 8 caracteres.' : undefined}
            {...campo('senha')}
          />
          <Botao type="submit" carregando={enviando}>{cadastro ? 'Criar conta' : 'Entrar'}</Botao>
          <p className="text-center">
            {cadastro ? 'Já tem conta? ' : 'Ainda não tem conta? '}
            <Link to={cadastro ? '/login' : '/cadastro'} state={state} className={estiloLink}>
              {cadastro ? 'Entrar' : 'Criar conta'}
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
