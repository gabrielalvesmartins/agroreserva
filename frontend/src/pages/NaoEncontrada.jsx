import { Link } from 'react-router';

export function NaoEncontrada() {
  return (
    <main className="px-4 py-24 text-center">
      <h1 className="font-titulo text-4xl font-bold">Página não encontrada</h1>
      <p className="mt-2 text-slate-600">O endereço digitado não existe.</p>
      <Link to="/maquinas" className="mt-6 inline-block font-semibold text-mata-700 underline">
        Ir para as máquinas
      </Link>
    </main>
  );
}
