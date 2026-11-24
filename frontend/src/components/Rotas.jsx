import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Carregando, EstadoErro } from './Estados.jsx';

// Melhora a navegação; quem garante a segurança é o backend.
export function RotaProtegida({ somenteAdmin = false }) {
  const { usuario, admin, carregando, erro, restaurar } = useAuth();
  const local = useLocation();

  if (carregando) return <Carregando texto="Verificando sua sessão" />;
  if (erro) return <EstadoErro erro={erro} aoTentar={restaurar} />;
  if (!usuario) return <Navigate to="/login" replace state={{ de: local.pathname }} />;
  if (somenteAdmin && !admin) {
    return (
      <EstadoErro
        titulo="Acesso negado"
        erro={{ message: 'Esta página é exclusiva para administradores.' }}
      />
    );
  }
  return <Outlet />;
}

// Quem já entrou não precisa ver login e cadastro.
export function RotaPublica() {
  const { usuario, carregando } = useAuth();
  const local = useLocation();
  if (carregando) return <Carregando texto="Verificando sua sessão" />;
  return usuario ? <Navigate to={local.state?.de ?? '/maquinas'} replace /> : <Outlet />;
}
