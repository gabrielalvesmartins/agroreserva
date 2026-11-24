const VARIANTES = {
  principal: 'bg-trator-400 text-mata-900 hover:bg-trator-300',
  secundario: 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50',
  perigo: 'bg-barro-600 text-white hover:bg-barro-700',
};

export function Botao({ variante = 'principal', carregando = false, className = '', children, ...props }) {
  return (
    <button
      type="button"
      {...props}
      disabled={carregando || props.disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTES[variante]} ${className}`}
    >
      {carregando && <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  );
}
