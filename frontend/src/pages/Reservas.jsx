import { useCallback, useState } from 'react';
import { Link } from 'react-router';
import { Botao } from '../components/Botao.jsx';
import { Campo } from '../components/Campo.jsx';
import { Carregando, EstadoErro, EstadoVazio } from '../components/Estados.jsx';
import { FormReserva } from '../components/FormReserva.jsx';
import { ModalConfirmacao } from '../components/Modal.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useAviso } from '../contexts/AvisoContext.jsx';
import { api } from '../services/api.js';
import { contarDias, dataBr, hoje, moeda } from '../utils/formato.js';
import { useConsulta } from '../utils/useConsulta.js';

function situacao(r) {
  if (r.status === 'CANCELADA') return ['Cancelada', 'bg-slate-200 text-slate-700'];
  if (r.dataFim < hoje()) return ['Encerrada', 'bg-slate-200 text-slate-700'];
  if (r.dataInicio <= hoje()) return ['Em uso', 'bg-trator-400 text-mata-900'];
  return ['Agendada', 'bg-mata-100 text-mata-900'];
}

// escopo "minhas": reservas do usuário; "todas": visão do administrador
export function Reservas({ escopo }) {
  const { admin } = useAuth();
  const avisar = useAviso();
  const [status, setStatus] = useState('');
  const [modal, setModal] = useState(null); // { tipo, reserva }
  const [processando, setProcessando] = useState(false);
  const todas = escopo === 'todas';

  const buscar = useCallback(() => api.listarReservas({ escopo, status }), [escopo, status]);
  const { dados: reservas, erro, carregando, recarregar } = useConsulta(buscar);

  const fechar = () => setModal(null);
  const executar = (acao, mensagem) => async () => {
    setProcessando(true);
    try {
      await acao(modal.reserva.id);
      avisar(mensagem);
    } catch (e) {
      avisar(e.message, 'erro');
    } finally {
      recarregar();
      setProcessando(false);
      fechar();
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-titulo text-4xl font-bold">{todas ? 'Todas as reservas' : 'Minhas reservas'}</h1>
        <div className="flex w-full flex-wrap items-end gap-3 sm:w-auto">
          <Campo rotulo="Situação" nome="filtro-status" as="select" className="flex-1 sm:w-44" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todas</option>
            <option value="ATIVA">Ativas</option>
            <option value="CANCELADA">Canceladas</option>
          </Campo>
          <Botao onClick={() => setModal({ tipo: 'form' })}>Nova reserva</Botao>
        </div>
      </div>

      {erro && <EstadoErro erro={erro} aoTentar={recarregar} />}
      {carregando && !reservas && <Carregando texto="Carregando reservas" />}
      {reservas?.length === 0 && (
        <EstadoVazio titulo="Nenhuma reserva por aqui" texto={status ? 'Não há reservas com a situação escolhida.' : 'Consulte a agenda das máquinas e escolha um período livre.'}>
          <Link to="/maquinas" className="font-semibold text-mata-700 underline">Ver máquinas</Link>
        </EstadoVazio>
      )}
      {reservas?.length > 0 && (
        <ul className={`grid gap-3 ${carregando ? 'opacity-60' : ''}`} aria-busy={carregando}>
          {reservas.map((r) => {
            const [texto, cor] = situacao(r);
            const ativa = r.status === 'ATIVA';
            // Mesma regra do backend: depois de iniciada, só o administrador altera
            const podeAlterar = admin || r.dataInicio > hoje();
            return (
              <li key={r.id} className="grid gap-3 rounded-lg bg-white p-4 shadow-sm sm:p-5 lg:grid-cols-[1fr_13rem_auto] lg:items-center lg:gap-6">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="rounded-sm bg-mata-900 px-2 py-0.5 font-semibold text-trator-300">{r.maquina.codigo}</span>
                    <span className={`rounded-sm px-2 py-0.5 font-semibold ${cor}`}>{texto}</span>
                  </div>
                  <h2 className="mt-2 font-titulo text-2xl leading-tight font-bold break-words">{r.maquina.nome}</h2>
                  <p className="break-words text-slate-600">{r.propriedade}. {r.finalidade}</p>
                  {todas && <p className="mt-1 text-sm break-words">Reservado por <strong>{r.usuario.nome}</strong> ({r.usuario.email})</p>}
                </div>
                <div>
                  <p className="font-semibold">{dataBr(r.dataInicio)} a {dataBr(r.dataFim)}</p>
                  <p className="text-slate-600">{contarDias(r.dataInicio, r.dataFim)} dia(s), {moeda(r.valorTotal)}</p>
                </div>
                <div className="flex flex-wrap gap-2 lg:w-32 lg:flex-col">
                  {ativa && podeAlterar && <Botao variante="secundario" onClick={() => setModal({ tipo: 'form', reserva: r })}>Editar</Botao>}
                  {ativa && podeAlterar && <Botao variante="secundario" onClick={() => setModal({ tipo: 'cancelar', reserva: r })}>Cancelar</Botao>}
                  {(!ativa || podeAlterar) && <Botao variante="secundario" onClick={() => setModal({ tipo: 'excluir', reserva: r })}>Excluir</Botao>}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {modal?.tipo === 'form' && (
        <FormReserva reserva={modal.reserva} aoFechar={fechar} aoSalvar={() => { fechar(); recarregar(); }} />
      )}
      {modal?.tipo === 'cancelar' && (
        <ModalConfirmacao
          titulo="Cancelar reserva"
          texto="O período volta a ficar livre para outros produtores e o registro continua no histórico."
          acao="Cancelar reserva"
          carregando={processando}
          aoConfirmar={executar(api.cancelarReserva, 'Reserva cancelada.')}
          aoFechar={fechar}
        />
      )}
      {modal?.tipo === 'excluir' && (
        <ModalConfirmacao
          titulo="Excluir reserva"
          texto="O registro será apagado definitivamente. Esta ação não pode ser desfeita."
          acao="Excluir reserva"
          carregando={processando}
          aoConfirmar={executar(api.excluirReserva, 'Reserva excluída.')}
          aoFechar={fechar}
        />
      )}
    </>
  );
}
