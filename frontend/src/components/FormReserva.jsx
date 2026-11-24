import { useCallback } from 'react';
import { useAviso } from '../contexts/AvisoContext.jsx';
import { api } from '../services/api.js';
import { contarDias, dataBr, hoje, moeda } from '../utils/formato.js';
import { useConsulta } from '../utils/useConsulta.js';
import { Botao } from './Botao.jsx';
import { Campo } from './Campo.jsx';
import { ErroFormulario } from './ErroFormulario.jsx';
import { Carregando, EstadoErro } from './Estados.jsx';
import { Modal } from './Modal.jsx';
import { useFormulario } from './useFormulario.js';

// Serve para criar (maquinaId/dia) e para editar (reserva).
export function FormReserva({ reserva, maquinaId, dia, aoFechar, aoSalvar }) {
  const avisar = useAviso();
  const buscar = useCallback(() => api.listarMaquinas(), []);
  const { dados: maquinas, erro, recarregar } = useConsulta(buscar);
  const { valores, campo, enviar, enviando, erroGeral } = useFormulario({
    maquinaId: reserva?.maquinaId ?? maquinaId ?? '',
    dataInicio: reserva?.dataInicio ?? dia ?? '',
    dataFim: reserva?.dataFim ?? dia ?? '',
    propriedade: reserva?.propriedade ?? '',
    finalidade: reserva?.finalidade ?? '',
  });

  const maquina = maquinas?.find((m) => m.id === Number(valores.maquinaId));
  const { dataInicio, dataFim } = valores;
  const diarias = dataInicio && dataFim && dataFim >= dataInicio ? contarDias(dataInicio, dataFim) : 0;
  const ocupacoes = maquina?.ocupacoes.filter((o) => o.reservaId !== reserva?.id) ?? [];

  const salvar = enviar(async (dados) => {
    await (reserva ? api.atualizarReserva(reserva.id, dados) : api.criarReserva(dados));
    avisar(reserva ? 'Reserva atualizada.' : 'Reserva confirmada.');
    aoSalvar();
  });

  return (
    <Modal titulo={reserva ? 'Editar reserva' : 'Reservar máquina'} aoFechar={aoFechar}>
      {erro && <EstadoErro erro={erro} aoTentar={recarregar} />}
      {!erro && !maquinas && <Carregando texto="Carregando máquinas" />}
      {maquinas && (
        <form onSubmit={salvar} noValidate className="grid gap-4 sm:grid-cols-2">
          <ErroFormulario mensagem={erroGeral} className="sm:col-span-2" />
          <Campo rotulo="Máquina" as="select" className="sm:col-span-2" {...campo('maquinaId')}>
            <option value="">Selecione</option>
            {maquinas
              .filter((m) => m.status === 'DISPONIVEL' || m.id === reserva?.maquinaId)
              .map((m) => <option key={m.id} value={m.id}>{m.codigo} · {m.nome}</option>)}
          </Campo>
          <Campo rotulo="Início" type="date" min={hoje()} {...campo('dataInicio')} />
          <Campo rotulo="Término" type="date" min={dataInicio || hoje()} {...campo('dataFim')} />
          {ocupacoes.length > 0 && (
            <p className="text-sm text-slate-600 sm:col-span-2">
              Já reservada em: {ocupacoes.map((o) => `${dataBr(o.dataInicio)} a ${dataBr(o.dataFim)}`).join('; ')}.
            </p>
          )}
          <Campo rotulo="Local de uso" placeholder="Ex.: Fazenda Boa Vista, talhão 3" maxLength={120} className="sm:col-span-2" {...campo('propriedade')} />
          <Campo rotulo="Finalidade" placeholder="Ex.: preparo de solo para plantio de milho" as="textarea" rows={2} maxLength={300} className="sm:col-span-2" {...campo('finalidade')} />
          {maquina && diarias > 0 && (
            <p className="flex justify-between gap-4 rounded-md bg-mata-50 p-3 sm:col-span-2">
              <span>{diarias} {diarias === 1 ? 'diária' : 'diárias'} de {moeda(maquina.valorDiaria)}</span>
              <strong>{moeda(diarias * maquina.valorDiaria)}</strong>
            </p>
          )}
          <div className="flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row sm:justify-end">
            <Botao variante="secundario" onClick={aoFechar}>Voltar</Botao>
            <Botao type="submit" carregando={enviando}>{reserva ? 'Salvar alterações' : 'Confirmar reserva'}</Botao>
          </div>
        </form>
      )}
    </Modal>
  );
}
