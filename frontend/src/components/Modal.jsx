import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Botao } from './Botao.jsx';

// Base: componente Dialog do Headless UI (foco e tecla Esc já tratados).
export function Modal({ titulo, aoFechar, children }) {
  return (
    <Dialog open onClose={aoFechar} className="relative z-40">
      <DialogBackdrop className="fixed inset-0 bg-mata-900/60" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center sm:items-center sm:p-4">
          <DialogPanel className="w-full max-w-xl rounded-t-xl bg-white p-5 shadow-xl sm:rounded-xl sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <DialogTitle className="font-titulo text-2xl font-bold">{titulo}</DialogTitle>
              <button type="button" onClick={aoFechar} aria-label="Fechar" className="rounded p-1 hover:bg-slate-100">
                <XMarkIcon className="size-6" />
              </button>
            </div>
            {children}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}

export function ModalConfirmacao({ titulo, texto, acao, carregando, aoConfirmar, aoFechar }) {
  return (
    <Modal titulo={titulo} aoFechar={aoFechar}>
      <p>{texto}</p>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Botao variante="secundario" onClick={aoFechar}>Voltar</Botao>
        <Botao variante="perigo" carregando={carregando} onClick={aoConfirmar}>{acao}</Botao>
      </div>
    </Modal>
  );
}
