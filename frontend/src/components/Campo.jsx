// Rótulo + campo + mensagem de erro. "as" permite usar select ou textarea.
export function Campo({ rotulo, nome, erro, ajuda, as: Elemento = 'input', className = '', ...props }) {
  return (
    <div className={className}>
      <label htmlFor={nome} className="mb-1 block text-sm font-semibold">
        {rotulo}
      </label>
      <Elemento
        id={nome}
        name={nome}
        className="campo"
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro || ajuda ? `${nome}-info` : undefined}
        {...props}
      />
      {(erro || ajuda) && (
        <p id={`${nome}-info`} className={`mt-1 text-sm ${erro ? 'text-barro-700' : 'text-slate-600'}`}>
          {erro || ajuda}
        </p>
      )}
    </div>
  );
}
