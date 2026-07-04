import { useState, useEffect } from 'react';
import { Plus, Trash2, Package } from 'lucide-react';
import Modal from '../ui/Modal';
import { itemNotaFiscalService } from '../../services/itemNotaFiscalService';
import { getProdutos } from '../../services/produtoService';
import { useToast } from '../../hooks/useToast';

function ItensNotaFiscalModal({ isOpen, onClose, notaFiscal }) {
    const [itens, setItens] = useState([]);
    const [produtos, setProdutos] = useState([]);
    const [produtoId, setProdutoId] = useState('');
    const [quantidade, setQuantidade] = useState('');
    const [valorUnitario, setValorUnitario] = useState('');
    const [carregando, setCarregando] = useState(false);
    const toast = useToast();

    useEffect(() => {
        if (isOpen && notaFiscal) {
            carregarItens();
            getProdutos().then(setProdutos).catch(() => setProdutos([]));
        }
    }, [isOpen, notaFiscal]);

    const carregarItens = async () => {
        try {
            const dados = await itemNotaFiscalService.listarPorNota(notaFiscal.id);
            setItens(dados);
        } catch (error) {
            console.error('Erro ao carregar itens:', error);
        }
    };

    const handleSelecionarProduto = (id) => {
        setProdutoId(id);

        const produto = produtos.find((p) => p.id === parseInt(id));
        if (produto) {
            setQuantidade(produto.quantidade?.toString() || '');
            setValorUnitario(produto.preco?.toString() || '');
        } else {
            setQuantidade('');
            setValorUnitario('');
        }
    };

    const handleAdicionar = async (e) => {
        e.preventDefault();
        if (!produtoId || !quantidade || !valorUnitario) return;

        setCarregando(true);
        try {
            await itemNotaFiscalService.cadastrar({
                notaFiscalId: notaFiscal.id,
                produtoId: parseInt(produtoId),
                quantidade: parseInt(quantidade),
                valorUnitario: parseFloat(valorUnitario),
            });
            toast.success('Item adicionado com sucesso!');
            setProdutoId('');
            setQuantidade('');
            setValorUnitario('');
            await carregarItens();
        } catch (error) {
            toast.error('Erro ao adicionar item.');
            console.error(error);
        } finally {
            setCarregando(false);
        }
    };

    const handleRemover = async (itemId) => {
        try {
            await itemNotaFiscalService.deletar(itemId);
            toast.success('Item removido com sucesso!');
            await carregarItens();
        } catch (error) {
            toast.error('Erro ao remover item.');
            console.error(error);
        }
    };

    const valorTotalNota = itens.reduce((soma, item) => soma + (item.quantidade * item.valorUnitario), 0);

    if (!notaFiscal) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Itens da Nota Fiscal ${notaFiscal.numero}`} size="lg">
            <div className="space-y-6">
                {/* Formulário de adicionar item */}
                <form onSubmit={handleAdicionar} className="flex gap-2 items-end">
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Produto</label>
                        <select
                            value={produtoId}
                            onChange={(e) => handleSelecionarProduto(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">-- Selecione --</option>
                            {produtos.map((p) => (
                                <option key={p.id} value={p.id}>{p.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-24">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Qtd.</label>
                        <input
                            type="number"
                            min="1"
                            value={quantidade}
                            onChange={(e) => setQuantidade(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="w-32">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Valor Unit.</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={valorUnitario}
                            onChange={(e) => setValorUnitario(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={carregando}
                        className="p-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:bg-blue-400"
                        title="Adicionar item"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </form>

                {/* Lista de itens */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    {itens.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500">
                            <Package className="w-10 h-10 mb-2" />
                            <p className="text-sm">Nenhum item adicionado ainda.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Produto</th>
                                    <th className="text-center px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Qtd.</th>
                                    <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Valor Unit.</th>
                                    <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Subtotal</th>
                                    <th className="text-center px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">-</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {itens.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{item.produto?.nome || '-'}</td>
                                        <td className="px-4 py-2 text-center text-gray-600 dark:text-gray-300">{item.quantidade}</td>
                                        <td className="px-4 py-2 text-right text-gray-600 dark:text-gray-300">R$ {item.valorUnitario.toFixed(2)}</td>
                                        <td className="px-4 py-2 text-right font-medium text-gray-900 dark:text-gray-100">
                                            R$ {(item.quantidade * item.valorUnitario).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <button
                                                onClick={() => handleRemover(item.id)}
                                                className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                                                title="Remover item"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Total */}
                <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        Total dos itens: R$ {valorTotalNota.toFixed(2)}
                    </p>
                </div>
            </div>
        </Modal>
    );
}

export default ItensNotaFiscalModal;