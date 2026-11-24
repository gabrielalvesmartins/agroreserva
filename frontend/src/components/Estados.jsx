import { useEffect, useState } from 'react';
import { Botao } from './Botao.jsx';

export function Carregando({ texto = 'Carregando' }) {
  const [demorou, setDemorou] = useState(false);
  useEffect(() => {
    const espera = setTimeout(() => setDemorou(true), 6000);
    return () => clearTimeout(espera);
  }, []);
  return (
    <div role="status" className="flex flex-col items-center gap-4 px-4 py-20 text-center text-slate-600">
      <span className="size-9 animate-spin rounded-full border-4 border-slate-300 border-t-mata-600" />
      <p>{texto}…</p>
      {demorou && <p className="text-sm">O servidor pode levar até um minuto para iniciar.</p>}
    </div>
  );
}

export function EstadoVazio({ titulo, texto, children }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-slate-400 bg-white px-6 py-16 text-center">
      <h2 className="font-titulo text-2xl font-semibold">{titulo}</h2>
      <p className="max-w-md text-slate-600">{texto}</p>
      {children}
    </div>
  );
}

export function EstadoErro({ titulo = 'Algo deu errado', erro, aoTentar }) {
  return (
    <div role="alert" className="mx-auto my-12 flex max-w-lg flex-col items-center gap-3 rounded-lg bg-barro-50 px-6 py-12 text-center">
      <h2 className="font-titulo text-2xl font-semibold text-barro-700">{titulo}</h2>
      <p>{erro.message}</p>
      {aoTentar && <Botao onClick={aoTentar}>Tentar novamente</Botao>}
    </div>
  );
}
