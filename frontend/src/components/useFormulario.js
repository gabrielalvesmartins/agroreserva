import { useState } from 'react';

// Guarda os valores, os erros por campo vindos da API e o estado de envio.
export function useFormulario(iniciais) {
  const [valores, setValores] = useState(iniciais);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);

  const campo = (nome) => ({
    nome,
    value: valores[nome],
    erro: erros[nome],
    onChange: (e) => {
      setValores((v) => ({ ...v, [nome]: e.target.value }));
      setErros((anteriores) => ({ ...anteriores, [nome]: undefined }));
    },
  });

  const enviar = (acao) => async (evento) => {
    evento.preventDefault();
    setErros({});
    setErroGeral('');
    setEnviando(true);
    try {
      await acao(valores);
    } catch (erro) {
      setErros(erro.campos ?? {});
      setErroGeral(erro.message);
    } finally {
      setEnviando(false);
    }
  };

  return { valores, campo, enviar, enviando, erroGeral };
}
