import { diaDaSemana, dataBr, hoje, ocupacaoNoDia, somarDias } from '../utils/formato.js';

const DIAS = 14;

// Mostra os próximos 14 dias da máquina: livre ou reservado.
// Clicar em um dia livre abre a reserva já com essa data.
export function FaixaAgenda({ maquina, aoEscolher }) {
  const inicio = hoje();
  const dias = Array.from({ length: DIAS }, (_, i) => somarDias(inicio, i));
  const disponivel = maquina.status === 'DISPONIVEL';

  return (
    <ol className="grid grid-cols-7 gap-1 sm:grid-cols-14" aria-label={`Agenda de ${maquina.nome}`}>
      {dias.map((dia) => {
        const ocupado = Boolean(ocupacaoNoDia(maquina.ocupacoes, dia));
        const livre = disponivel && !ocupado;
        const cor = ocupado
          ? 'bg-trator-400 text-mata-900'
          : livre
            ? 'bg-mata-50 text-mata-700 hover:bg-mata-100'
            : 'bg-slate-200 text-slate-500';
        const situacao = ocupado ? 'reservado' : livre ? 'livre' : 'indisponível';
        return (
          <li key={dia}>
            <button
              type="button"
              disabled={!livre}
              onClick={() => aoEscolher(dia)}
              aria-label={`${dataBr(dia)}: ${situacao}`}
              title={`${dataBr(dia)}: ${situacao}`}
              className={`w-full rounded-sm py-1 text-center leading-tight disabled:cursor-not-allowed ${cor}`}
            >
              <span className="block text-xs">{diaDaSemana(dia)}</span>
              <span className="block font-semibold tabular-nums">{dia.slice(8)}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
