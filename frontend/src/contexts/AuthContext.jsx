import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, definirAoPerderSessao, sessao } from '../services/api.js';
import { useAviso } from './AvisoContext.jsx';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const avisar = useAviso();
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const sair = useCallback(() => {
    sessao.limpar();
    setUsuario(null);
  }, []);

  // Ao abrir a página, confere na API se o token guardado ainda vale.
  const restaurar = useCallback(async () => {
    setErro(null);
    setCarregando(true);
    try {
      if (sessao.token()) setUsuario(await api.eu());
    } catch (e) {
      if (e.status !== 401) setErro(e); // servidor fora do ar não deve derrubar a sessão
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    // Sessão inválida ou expirada em qualquer chamada: sai e avisa
    definirAoPerderSessao((mensagem) => {
      sair();
      avisar(mensagem, 'erro');
    });
    restaurar();
    // Logout ou login feito em outra aba
    const aoMudarEmOutraAba = () => (sessao.token() ? restaurar() : setUsuario(null));
    window.addEventListener('storage', aoMudarEmOutraAba);
    return () => window.removeEventListener('storage', aoMudarEmOutraAba);
  }, [sair, avisar, restaurar]);

  const abrirSessao = ({ token, usuario: dados }) => {
    sessao.salvar(token);
    setUsuario(dados);
  };

  const valor = {
    usuario,
    carregando,
    erro,
    restaurar,
    sair,
    admin: usuario?.perfil === 'ADMIN',
    entrar: async (dados) => abrirSessao(await api.entrar(dados)),
    cadastrar: async (dados) => abrirSessao(await api.cadastrar(dados)),
  };
  return <AuthContext value={valor}>{children}</AuthContext>;
}
