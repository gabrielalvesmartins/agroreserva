import { useAviso } from '../contexts/AvisoContext.jsx';
import { api } from '../services/api.js';
import { CATEGORIAS, STATUS_MAQUINA } from '../utils/formato.js';
import { Botao } from './Botao.jsx';
import { Campo } from './Campo.jsx';
import { ErroFormulario } from './ErroFormulario.jsx';
import { Modal } from './Modal.jsx';
import { useFormulario } from './useFormulario.js';

const VAZIA = { codigo: '', nome: '', categoria: 'Trator', marca: '', ano: '', valorDiaria: '', descricao: '', status: 'DISPONIVEL' };

export function FormMaquina({ maquina, aoFechar, aoSalvar }) {
  const avisar = useAviso();
  const iniciais = Object.fromEntries(Object.keys(VAZIA).map((c) => [c, maquina?.[c] ?? VAZIA[c]]));
  const { campo, enviar, enviando, erroGeral } = useFormulario(iniciais);

  const salvar = enviar(async (valores) => {
    const numero = (texto) => (texto === '' ? undefined : Number(texto));
    const dados = { ...valores, ano: numero(valores.ano), valorDiaria: numero(valores.valorDiaria) };
    await (maquina ? api.atualizarMaquina(maquina.id, dados) : api.criarMaquina(dados));
    avisar(maquina ? 'Máquina atualizada.' : 'Máquina cadastrada.');
    aoSalvar();
  });

  return (
    <Modal titulo={maquina ? 'Editar máquina' : 'Cadastrar máquina'} aoFechar={aoFechar}>
      <form onSubmit={salvar} noValidate className="grid gap-4 sm:grid-cols-2">
        <ErroFormulario mensagem={erroGeral} className="sm:col-span-2" />
        <Campo rotulo="Código" placeholder="Ex.: TR-03" maxLength={20} {...campo('codigo')} />
        <Campo rotulo="Nome" maxLength={100} {...campo('nome')} />
        <Campo rotulo="Categoria" as="select" {...campo('categoria')}>
          {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
        </Campo>
        <Campo rotulo="Marca" maxLength={60} {...campo('marca')} />
        <Campo rotulo="Ano" type="number" {...campo('ano')} />
        <Campo rotulo="Valor da diária (R$)" type="number" step="0.01" min="0" {...campo('valorDiaria')} />
        <Campo rotulo="Situação" as="select" className="sm:col-span-2" {...campo('status')}>
          {Object.entries(STATUS_MAQUINA).map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
        </Campo>
        <Campo rotulo="Descrição (opcional)" as="textarea" rows={3} maxLength={500} className="sm:col-span-2" {...campo('descricao')} />
        <div className="flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row sm:justify-end">
          <Botao variante="secundario" onClick={aoFechar}>Voltar</Botao>
          <Botao type="submit" carregando={enviando}>{maquina ? 'Salvar alterações' : 'Cadastrar máquina'}</Botao>
        </div>
      </form>
    </Modal>
  );
}
