import { PencilSquareIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useCallback, useEffect, useState } from 'react';
import { Botao } from '../components/Botao.jsx';
import { Campo } from '../components/Campo.jsx';
import { Carregando, EstadoErro, EstadoVazio } from '../components/Estados.jsx';
import { FaixaAgenda } from '../components/FaixaAgenda.jsx';
import { FormMaquina } from '../components/FormMaquina.jsx';
import { FormReserva } from '../components/FormReserva.jsx';
import { ModalConfirmacao } from '../components/Modal.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useAviso } from '../contexts/AvisoContext.jsx';
import { api } from '../services/api.js';
import { CATEGORIAS, STATUS_MAQUINA, moeda } from '../utils/formato.js';
import { useConsulta } from '../utils/useConsulta.js';

const COR_STATUS = {
  DISPONIVEL: 'bg-mata-100 text-mata-900',
  MANUTENCAO: 'bg-barro-50 text-barro-700',
  INATIVA: 'bg-slate-200 text-slate-700',
};

export function Maquinas() {
  const { admin } = useAuth();
  const avisar = useAviso();
  const [busca, setBusca] = useState('');
  const [termo, setTermo] = useState('');
  const [categoria, setCategoria] = useState('');
  const [status, setStatus] = useState('');
  const [modal, setModal] = useState(null); // { tipo, maquina, dia }
  const [excluindo, setExcluindo] = useState(false);

  // Espera a pessoa parar de digitar antes de consultar a API
  useEffect(() => {
    const espera = setTimeout(() => setTermo(busca.trim()), 350);
    return () => clearTimeout(espera);
  }, [busca]);

  const buscar = useCallback(() => api.listarMaquinas({ busca: termo, categoria, status }), [termo, categoria, status]);
  const { dados: maquinas, erro, carregando, recarregar } = useConsulta(buscar);
  const filtrando = Boolean(termo || categoria || status);

  const fechar = () => setModal(null);
  const aoSalvar = () => {
    fechar();
    recarregar();
  };

  const excluir = async () => {
    setExcluindo(true);
    try {
      await api.excluirMaquina(modal.maquina.id);
      avisar('Máquina excluída.');
      recarregar();
    } catch (e) {
      avisar(e.message, 'erro');
    } finally {
      setExcluindo(false);
      fechar();
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-titulo text-4xl font-bold">Máquinas</h1>
          <p className="text-slate-600">Agenda dos próximos 14 dias. Escolha um dia livre para reservar.</p>
        </div>
        {admin && (
          <Botao onClick={() => setModal({ tipo: 'maquina' })}>
            <PlusIcon className="size-5" /> Cadastrar máquina
          </Botao>
        )}
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Campo rotulo="Buscar" nome="busca" type="search" maxLength={100} placeholder="Nome, código ou marca" value={busca} onChange={(e) => setBusca(e.target.value)} />
        <Campo rotulo="Categoria" nome="filtro-categoria" as="select" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="">Todas</option>
          {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
        </Campo>
        <Campo rotulo="Situação" nome="filtro-status" as="select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todas</option>
          {Object.entries(STATUS_MAQUINA).map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
        </Campo>
      </div>

      <ul className="mb-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-700" aria-label="Legenda">
        {[['bg-mata-100', 'Livre'], ['bg-trator-400', 'Reservado'], ['bg-slate-300', 'Indisponível']].map(([cor, texto]) => (
          <li key={texto} className="flex items-center gap-2"><span className={`size-3.5 rounded-sm ${cor}`} /> {texto}</li>
        ))}
      </ul>

      {erro && <EstadoErro erro={erro} aoTentar={recarregar} />}
      {carregando && !maquinas && <Carregando texto="Carregando máquinas" />}
      {maquinas?.length === 0 && (
        <EstadoVazio
          titulo={filtrando ? 'Nenhuma máquina encontrada' : 'Nenhuma máquina cadastrada'}
          texto={filtrando ? 'Mude a busca ou os filtros para ver outras máquinas.' : 'As máquinas aparecem aqui depois que o administrador as cadastra.'}
        />
      )}
      {maquinas?.length > 0 && (
        <ul className={`grid gap-4 ${carregando ? 'opacity-60' : ''}`} aria-busy={carregando}>
          {maquinas.map((m) => (
            <li key={m.id} className="grid gap-4 rounded-lg bg-white p-4 shadow-sm sm:p-5 lg:grid-cols-[18rem_1fr] lg:items-center lg:gap-8">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="rounded-sm bg-mata-900 px-2 py-0.5 font-semibold text-trator-300">{m.codigo}</span>
                  <span className={`rounded-sm px-2 py-0.5 font-semibold ${COR_STATUS[m.status]}`}>{STATUS_MAQUINA[m.status]}</span>
                </div>
                <h2 className="mt-2 font-titulo text-2xl leading-tight font-bold break-words">{m.nome}</h2>
                <p className="text-slate-600">{m.categoria}, {m.marca}, {m.ano}</p>
                {m.descricao && <p className="mt-1 text-sm break-words text-slate-600">{m.descricao}</p>}
              </div>
              <div className="grid min-w-0 gap-4">
                <FaixaAgenda maquina={m} aoEscolher={(dia) => setModal({ tipo: 'reserva', maquina: m, dia })} />
                <div className="flex flex-wrap items-center gap-3">
                  <p className="mr-auto"><strong className="text-lg">{moeda(m.valorDiaria)}</strong> por dia</p>
                  {admin && (
                    <>
                      <Botao variante="secundario" aria-label={`Editar ${m.nome}`} onClick={() => setModal({ tipo: 'maquina', maquina: m })}>
                        <PencilSquareIcon className="size-5" /> Editar
                      </Botao>
                      <Botao variante="secundario" aria-label={`Excluir ${m.nome}`} onClick={() => setModal({ tipo: 'excluir', maquina: m })}>
                        <TrashIcon className="size-5" /> Excluir
                      </Botao>
                    </>
                  )}
                  <Botao disabled={m.status !== 'DISPONIVEL'} aria-label={`Reservar ${m.nome}`} onClick={() => setModal({ tipo: 'reserva', maquina: m })}>
                    Reservar
                  </Botao>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modal?.tipo === 'maquina' && <FormMaquina maquina={modal.maquina} aoFechar={fechar} aoSalvar={aoSalvar} />}
      {modal?.tipo === 'reserva' && <FormReserva maquinaId={modal.maquina.id} dia={modal.dia} aoFechar={fechar} aoSalvar={aoSalvar} />}
      {modal?.tipo === 'excluir' && (
        <ModalConfirmacao
          titulo="Excluir máquina"
          texto={`Excluir ${modal.maquina.codigo} · ${modal.maquina.nome}? Esta ação não pode ser desfeita.`}
          acao="Excluir máquina"
          carregando={excluindo}
          aoConfirmar={excluir}
          aoFechar={fechar}
        />
      )}
    </>
  );
}
