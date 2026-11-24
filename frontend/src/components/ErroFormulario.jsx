export function ErroFormulario({ mensagem, className = '' }) {
  if (!mensagem) return null;
  return (
    <p role="alert" className={`rounded-md border-l-4 border-barro-600 bg-barro-50 p-3 text-barro-700 ${className}`}>
      {mensagem}
    </p>
  );
}
