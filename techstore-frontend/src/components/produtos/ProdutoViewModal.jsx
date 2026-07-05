import { useState, useEffect } from 'react';
import { Package, Tag, DollarSign, Boxes, Calendar, Ruler, Globe, ShieldCheck, FileText } from 'lucide-react';
import Modal from '../ui/Modal';
import { getProduto } from '../../services/produtoService';

function ProdutoViewModal({ isOpen, onClose, produtoId }) {
    const [produto, setProduto] = useState(null);
    const [carregando, setCarregando] = useState(true);

    // Sempre que o modal abrir para um produto diferente, busca os dados completos
    // dele na API (incluindo Categoria e DetalheProduto, já trazidos pelo backend).
    useEffect(() => {
        if (isOpen && produtoId) {
            setCarregando(true);
            getProduto(produtoId)
                .then(setProduto)
                .catch(() => setProduto(null))
                .finally(() => setCarregando(false));
        }
    }, [isOpen, produtoId]);

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={produto ? produto.nome : 'Detalhes do Produto'} size="lg">
            {carregando ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-10">Carregando informações...</p>
            ) : !produto ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-10">Não foi possível carregar este produto.</p>
            ) : (
                <div className="space-y-6">
                    {/* Cabeçalho: nome e descrição */}
                    <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{produto.nome}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {produto.descricao || 'Sem descrição cadastrada.'}
                            </p>
                        </div>
                    </div>

                    {/* Informações principais em grade */}
                    <div className="grid grid-cols-2 gap-4">
                        <InfoItem icon={Tag} label="Categoria" value={produto.categoria?.nome || 'Sem categoria'} />
                        <InfoItem icon={DollarSign} label="Preço" value={`R$ ${produto.preco.toFixed(2)}`} />
                        <InfoItem icon={Boxes} label="Estoque" value={`${produto.quantidade} unidades`} />
                        <InfoItem
                            icon={Calendar}
                            label="Cadastrado em"
                            value={new Date(produto.dataCriacao).toLocaleDateString('pt-BR')}
                        />
                    </div>

                    {/* Detalhes técnicos (DetalheProduto), exibidos só se existirem */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Detalhes Técnicos
                        </h4>

                        {produto.detalheProduto ? (
                            <div className="grid grid-cols-2 gap-4">
                                <InfoItem
                                    icon={ShieldCheck}
                                    label="Garantia"
                                    value={produto.detalheProduto.garantia || '-'}
                                />
                                <InfoItem
                                    icon={Globe}
                                    label="País de Origem"
                                    value={produto.detalheProduto.paisDeOrigem || '-'}
                                />
                                <InfoItem
                                    icon={Ruler}
                                    label="Peso"
                                    value={produto.detalheProduto.pesoGramas ? `${produto.detalheProduto.pesoGramas} g` : '-'}
                                />
                                <div className="col-span-2">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Especificações</p>
                                    <p className="text-sm text-gray-800 dark:text-gray-200">
                                        {produto.detalheProduto.especificacoes || 'Nenhuma especificação cadastrada.'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 dark:text-gray-500">
                                Nenhum detalhe técnico cadastrado para este produto.
                            </p>
                        )}
                    </div>

                    {/* Botão de fechar */}
                    <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={onClose}
                            className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
}

// Pequeno componente auxiliar para não repetir a mesma estrutura de "ícone + label + valor"
// em cada campo — mantém o JSX principal mais limpo e legível.
function InfoItem({ icon: Icon, label, value }) {
    return (
        <div className="flex items-start gap-2">
            <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
            <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{value}</p>
            </div>
        </div>
    );
}

export default ProdutoViewModal;