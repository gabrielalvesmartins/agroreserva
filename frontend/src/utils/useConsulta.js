import { useCallback, useEffect, useState } from 'react';

// Busca dados na API e controla os estados de carregamento e erro.
// "funcao" deve vir de um useCallback: quando ela muda, a busca é refeita.
export function useConsulta(funcao) {
  const [estado, setEstado] = useState({ dados: null, erro: null, carregando: true });
  const [versao, setVersao] = useState(0);
  const recarregar = useCallback(() => setVersao((v) => v + 1), []);

  useEffect(() => {
    let ativo = true; // ignora respostas que chegam depois de uma busca mais nova
    setEstado((e) => ({ ...e, erro: null, carregando: true }));
    funcao()
      .then((dados) => ativo && setEstado({ dados, erro: null, carregando: false }))
      .catch((erro) => ativo && setEstado({ dados: null, erro, carregando: false }));
    return () => {
      ativo = false;
    };
  }, [funcao, versao]);

  return { ...estado, recarregar };
}
