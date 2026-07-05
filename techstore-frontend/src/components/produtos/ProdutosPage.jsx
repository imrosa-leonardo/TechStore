import { useState, useEffect } from 'react';
import { Plus, RefreshCw, ShoppingCart } from 'lucide-react';
import {
    getProdutos,
    criarProduto,
    atualizarProduto,
    deletarProduto,
} from '../../services/produtoService';
import { useToast } from '../../hooks/useToast';
import ProdutoTable from './ProdutoTable';
import ProdutoFormModal from './ProdutoFormModal';
import ProdutoDeleteDialog from './ProdutoDeleteDialog';
import { getCategorias } from '../../services/categoriaService';
import { notaFiscalService } from '../../services/notaFiscalService';
import DetalheProdutoModal from './DetalheProdutoModal';
import ProdutoViewModal from './ProdutoViewModal';

function ProdutosPage() {
    const [produtos, setProdutos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [produtoEditando, setProdutoEditando] = useState(null);
    const [produtoDeletando, setProdutoDeletando] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [notasFiscais, setNotasFiscais] = useState([]);
    const [isDetalheModalOpen, setIsDetalheModalOpen] = useState(false);
    const [produtoDetalhe, setProdutoDetalhe] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [produtoVisualizandoId, setProdutoVisualizandoId] = useState(null);


    const toast = useToast();

    useEffect(() => {
        carregarProdutos();
    }, []);

    const carregarProdutos = async () => {
    try {
        setLoading(true);
        const [dadosProdutos, dadosCategorias, dadosNotasFiscais] = await Promise.all([
            getProdutos(),
            getCategorias().catch(() => []),
            notaFiscalService.listar().catch(() => []),
        ]);
            setProdutos(dadosProdutos);
            setCategorias(dadosCategorias);
            setNotasFiscais(dadosNotasFiscais);
    } catch (error) {
        toast.error('Erro ao carregar produtos');
        console.error('Erro: ', error);
    } finally {
        setLoading(false);
    }
};

        const handleNovo = () => {
            setProdutoEditando(null);
            setIsFormModalOpen(true);
        };

        const handleEditar = (produto) => {
            setProdutoEditando(produto);
            setIsFormModalOpen(true);
        };

        const handleSalvar = async (produto) => {
            try {
                if (produtoEditando) {
                    await atualizarProduto(produto);
                    toast.success(`Produto "${produto.nome}" atualizado com sucesso`);
                } else {
                    await criarProduto(produto);
                    toast.success(`Produto "${produto.nome}" cadastrado com sucesso`);
                }
                setIsFormModalOpen(false);
                setProdutoEditando(null);
                await carregarProdutos();
            } catch (error) {
                toast.error('Erro ao salvar produto, verifique os dados e tente novamente');
                console.error('Erro ao salvar', error);
            }
        };

        const handleConfirmarDelete = (produto) => {
            setProdutoDeletando(produto);
            setIsDeleteDialogOpen(true);
        };

        const handleDeletar = async () => {
            try {
                await deletarProduto(produtoDeletando.id);
                toast.success(`Produto "${produtoDeletando.nome}" excluído com sucesso`);
                setIsDeleteDialogOpen(false);
                setProdutoDeletando(null);
                await carregarProdutos();
            } catch (error) {
                toast.error('Erro ao excluir produto, tente novamente');
                console.error('Erro ao excluir', error);
            }
        };

        const handleVerDetalhe = (produto) => {
            setProdutoDetalhe(produto);
            setIsDetalheModalOpen(true);
        };

        const handleVisualizar = (produto) => {
            setProdutoVisualizandoId(produto.id);
            setIsViewModalOpen(true);
        };

        return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-x1 font-bold text-gray-800 dark:text-gray-100">Produtos</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {produtos.length}{'  '}{produtos.length === 1 ? 'produto cadastrado' : 'produtos cadastrados'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={carregarProdutos} title="Recarregar Lista" className="p-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-700 hover:text-gray-200 rounded-lg transition-colors">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}/> 
                    </button>
                    <button onClick={handleNovo} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">
                        <Plus className="w-4 h-4" />
                        Novo Produto
                    </button>
                </div>
             </div>

             {/* Loading */}

             {loading ? (
                <div className="flex items-center justify-center py-20">
                    <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
                    <span className="ml-3 text-gray-500 dark:text-gray-400">Carregando Produtos...</span>
                </div>
             ) : (
                <ProdutoTable
                    produtos={produtos}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onEditar={handleEditar}
                    onVerDetalhe={handleVerDetalhe}
                    onDeletar={handleConfirmarDelete}
                    onVisualizar={handleVisualizar}
                />
             )}

             {/* Modal de Formulario (criar/editar) */}

            <ProdutoFormModal
                isOpen={isFormModalOpen}
                onClose={() => {
                    setIsFormModalOpen(false);
                    setProdutoEditando(null);
                }}
                produtoEditando={produtoEditando}
                onSalvar={handleSalvar}
                categorias={categorias}
                notasFiscais={notasFiscais}
                />

            {/* Modal de Formulario (Detalhes do Produto) */ }
            <DetalheProdutoModal
                isOpen={isDetalheModalOpen}
                onClose={() => {
                    setIsDetalheModalOpen(false);
                    setProdutoDetalhe(null);
                }}
                produto={produtoDetalhe}
                />

             {/* Dialog de Confirmacao para Deletar */}

            <ProdutoDeleteDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setProdutoDeletando(null);
                }}
                onConfirm={handleDeletar}
                produto={produtoDeletando}
                />

            <ProdutoViewModal
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setProdutoVisualizandoId(null);
                }}
                produtoId={produtoVisualizandoId}
/>

        </div>
    );                  
}

export default ProdutosPage;