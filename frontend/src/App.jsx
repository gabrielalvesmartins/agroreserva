import { Navigate, Route, Routes } from 'react-router';
import { Layout } from './components/Layout.jsx';
import { RotaProtegida, RotaPublica } from './components/Rotas.jsx';
import { Acesso } from './pages/Acesso.jsx';
import { Maquinas } from './pages/Maquinas.jsx';
import { NaoEncontrada } from './pages/NaoEncontrada.jsx';
import { Reservas } from './pages/Reservas.jsx';

export function App() {
  return (
    <Routes>
      <Route element={<RotaPublica />}>
        <Route path="/login" element={<Acesso key="login" modo="login" />} />
        <Route path="/cadastro" element={<Acesso key="cadastro" modo="cadastro" />} />
      </Route>
      <Route element={<RotaProtegida />}>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/maquinas" replace />} />
          <Route path="/maquinas" element={<Maquinas />} />
          <Route path="/reservas" element={<Reservas key="minhas" escopo="minhas" />} />
          <Route element={<RotaProtegida somenteAdmin />}>
            <Route path="/admin/reservas" element={<Reservas key="todas" escopo="todas" />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<NaoEncontrada />} />
    </Routes>
  );
}
