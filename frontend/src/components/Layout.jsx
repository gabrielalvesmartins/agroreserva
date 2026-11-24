import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext.jsx';

const estiloLink = ({ isActive }) =>
  `border-b-4 px-1 py-3 font-semibold whitespace-nowrap ${
    isActive ? 'border-trator-400 text-white' : 'border-transparent text-mata-100 hover:text-white'
  }`;

export function Layout() {
  const { usuario, admin, sair } = useAuth();
  const navegar = useNavigate();

  const aoSair = () => {
    navegar('/login', { replace: true });
    sair();
  };

  return (
    <div className="min-h-screen">
      <header className="bg-mata-900 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 px-4">
          <span className="py-3 font-titulo text-2xl font-bold">AgroReserva</span>
          <nav className="order-last flex w-full gap-4 overflow-x-auto text-sm md:gap-6 md:text-base md:order-none md:w-auto" aria-label="Principal">
            <NavLink to="/maquinas" className={estiloLink}>Máquinas</NavLink>
            <NavLink to="/reservas" className={estiloLink}>Minhas reservas</NavLink>
            {admin && <NavLink to="/admin/reservas" className={estiloLink}>Todas as reservas</NavLink>}
          </nav>
          <div className="ml-auto flex items-center gap-4">
            <span className="hidden text-right text-sm leading-tight sm:block">
              <span className="block max-w-48 truncate font-semibold">{usuario.nome}</span>
              <span className="text-mata-100">{admin ? 'Administrador' : 'Produtor'}</span>
            </span>
            <button onClick={aoSair} className="flex items-center gap-2 rounded-md px-2 py-2 font-semibold hover:bg-mata-700">
              <ArrowRightStartOnRectangleIcon className="size-5" /> Sair
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
