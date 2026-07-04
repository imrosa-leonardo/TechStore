import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { fornecedorService } from '../../services/fornecedorService';
import { notaFiscalService } from '../../services/notaFiscalService';

function NotaFiscalFormModal({ isOpen, onClose, onSuccess, notaFiscal }) {
    const [numero, setNumero] = useState('');
    const [serie, setSerie] = useState('');
    const [dataEmissao, setDataEmissao] = useState('');
    const [fornecedorId, setFornecedorId] = useState('');
    const [fornecedores, setFornecedores] = useState([]);
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fornecedorService.listar().then(setFornecedores).catch(() => setFornecedores([]));

            if (notaFiscal) {
                setNumero(notaFiscal.numero || '');
                setSerie(notaFiscal.serie || '');
                setDataEmissao(notaFiscal.dataEmissao ? notaFiscal.dataEmissao.slice(0, 10) : '');
                setFornecedorId(notaFiscal.fornecedorId?.toString() || '');
            } else {
                setNumero('');
                setSerie('');
                setDataEmissao(new Date().toISOString().slice(0, 10));
                setFornecedorId('');
            }
            setErro('');
        }
    }, [isOpen, notaFiscal]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCarregando(true);
        setErro('');

        const dados = {
            numero,
            serie: serie || null,
            dataEmissao,
            fornecedorId: parseInt(fornecedorId),
        };

        try {
            if (notaFiscal) {
                dados.id = notaFiscal.id;
                await notaFiscalService.atualizar(notaFiscal.id, dados);
            } else {
                await notaFiscalService.cadastrar(dados);
            }
            onSuccess();
            onClose();
        } catch (error) {
            setErro(error.response?.data?.mensagem || 'Erro ao salvar nota fiscal.');
        } finally {
            setCarregando(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={notaFiscal ? 'Editar Nota Fiscal' : 'Nova Nota Fiscal'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {erro && (
                    <div className="p-3 rounded text-sm bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                        {erro}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Número</label>
                        <input
                            type="text"
                            value={numero}
                            onChange={(e) => setNumero(e.target.value)}
                            placeholder="Ex: 000123"
                            required
                            className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Série <span className="text-gray-400 dark:text-gray-500 font-normal">(opcional)</span>
                        </label>
                        <input
                            type="text"
                            value={serie}
                            onChange={(e) => setSerie(e.target.value)}
                            placeholder="Ex: 1"
                            className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fornecedor</label>
                    <select
                        value={fornecedorId}
                        onChange={(e) => setFornecedorId(e.target.value)}
                        required
                        className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white dark:bg-gray-900 dark:text-gray-100"
                    >
                        <option value="">-- Selecione um fornecedor --</option>
                        {fornecedores.map((f) => (
                            <option key={f.id} value={f.id}>{f.nome}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data de Emissão</label>
                    <input
                        type="date"
                        value={dataEmissao}
                        onChange={(e) => setDataEmissao(e.target.value)}
                        required
                        className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                    />
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
                    O valor total será calculado automaticamente com base nos itens adicionados após a criação da nota.
                </p>

                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" disabled={carregando} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:bg-blue-400 dark:disabled:bg-blue-800">
                        {carregando ? 'Salvando...' : notaFiscal ? 'Salvar Alterações' : 'Cadastrar Nota Fiscal'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default NotaFiscalFormModal;