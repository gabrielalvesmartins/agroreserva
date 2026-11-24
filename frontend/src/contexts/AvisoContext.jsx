import { CheckCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const AvisoContext = createContext(null);
export const useAviso = () => useContext(AvisoContext);

// Mensagens de sucesso e erro no canto da tela.
export function AvisoProvider({ children }) {
  const [aviso, setAviso] = useState(null);
  const avisar = useCallback((texto, tipo = 'sucesso') => setAviso({ texto, tipo }), []);

  useEffect(() => {
    if (!aviso) return;
    const espera = setTimeout(() => setAviso(null), 6000);
    return () => clearTimeout(espera);
  }, [aviso]);

  const sucesso = aviso?.tipo === 'sucesso';
  const Icone = sucesso ? CheckCircleIcon : ExclamationTriangleIcon;
  return (
    <AvisoContext value={avisar}>
      {children}
      <div aria-live="polite" className="fixed inset-x-4 bottom-4 z-50 sm:left-auto sm:w-96">
        {aviso && (
          <div className={`flex items-start gap-3 rounded-md p-4 text-white shadow-lg ${sucesso ? 'bg-mata-700' : 'bg-barro-700'}`}>
            <Icone className="size-6 shrink-0" />
            <p className="flex-1">{aviso.texto}</p>
            <button onClick={() => setAviso(null)} aria-label="Fechar aviso">
              <XMarkIcon className="size-5" />
            </button>
          </div>
        )}
      </div>
    </AvisoContext>
  );
}
