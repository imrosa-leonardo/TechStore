import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { detalheProdutoService } from '../../services/detalheProdutoService';
import { useToast } from '../../hooks/useToast';

function DetalheProdutoModal({ isOpen, onClose, produto }) {
    const [detalheId, setDetalheId] = useState(null);
    const [especificacoes, setEspecificacoes] = useState('');
    const [garantia, setGarantia] = useState('');
    const [paisDeOrigem, setPaisDeOrigem] = useState('');
    const [pesoGramas, setPesoGramas] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [buscando, setBuscando] = useState(true);
    const toast = useToast();

    // Sempre que o modal abre para um produto, tenta buscar o detalhe já existente.
    // Se não existir (404), apenas limpa os campos para permitir criar um novo.
    useEffect(() => {
        if (isOpen && produto) {
            setBuscando(true);
            detalheProdutoService.obterPorProduto(produto.id)
                .then((dados) => {
                    setDetalheId(dados.id);
                    setEspecificacoes(dados.especificacoes || '');
                    setGarantia(dados.garantia || '');
                    setPaisDeOrigem(dados.paisDeOrigem || '');
                    setPesoGramas(dados.pesoGramas?.toString() || '');
                })
                .catch(() => {
                    // 404 é esperado quando o produto ainda não tem detalhe cadastrado
                    setDetalheId(null);
                    setEspecificacoes('');
                    setGarantia('');
                    setPaisDeOrigem('');
                    setPesoGramas('');
                })
                .finally(() => setBuscando(false));
        }
    }, [isOpen, produto]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCarregando(true);

        const dados = {
            produtoId: produto.id,
            especificacoes: especificacoes || null,
            garantia: garantia || null,
            paisDeOrigem: paisDeOrigem || null,
            pesoGramas: pesoGramas ? parseFloat(pesoGramas) : null,
        };

        try {
            if (detalheId) {
                dados.id = detalheId;
                await detalheProdutoService.atualizar(detalheId, dados);
                toast.success('Detalhes atualizados com sucesso!');
            } else {
                await detalheProdutoService.cadastrar(dados);
                toast.success('Detalhes cadastrados com sucesso!');
            }
            onClose();
        } catch (error) {
            toast.error('Erro ao salvar os detalhes do produto.');
            console.error(error);
        } finally {
            setCarregando(false);
        }
    };

    if (!produto) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Detalhes de "${produto.nome}"`}>
            {buscando ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">Carregando...</p>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Especificações <span className="text-gray-400 dark:text-gray-500 font-normal">(opcional)</span>
                        </label>
                        <textarea
                            value={especificacoes}
                            onChange={(e) => setEspecificacoes(e.target.value)}
                            placeholder="Ex: Processador Ryzen 5, 16GB RAM, SSD 512GB"
                            rows="3"
                            className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Garantia <span className="text-gray-400 dark:text-gray-500 font-normal">(opcional)</span>
                            </label>
                            <input
                                type="text"
                                value={garantia}
                                onChange={(e) => setGarantia(e.target.value)}
                                placeholder="Ex: 12 meses"
                                className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                País de Origem <span className="text-gray-400 dark:text-gray-500 font-normal">(opcional)</span>
                            </label>
                            <input
                                type="text"
                                value={paisDeOrigem}
                                onChange={(e) => setPaisDeOrigem(e.target.value)}
                                placeholder="Ex: China"
                                className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Peso (gramas) <span className="text-gray-400 dark:text-gray-500 font-normal">(opcional)</span>
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={pesoGramas}
                            onChange={(e) => setPesoGramas(e.target.value)}
                            placeholder="Ex: 850"
                            className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                        />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={carregando} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:bg-blue-400 dark:disabled:bg-blue-800">
                            {carregando ? 'Salvando...' : detalheId ? 'Salvar Alterações' : 'Cadastrar Detalhes'}
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    );
}

export default DetalheProdutoModal;