import { useState, useEffect } from 'react';
import { Plus, RefreshCw, Tag } from 'lucide-react';
import { getCategorias, criarCategoria, atualizarCategoria, deletarCategoria } from '../../services/categoriaService';
import { getProdutos } from '../../services/produtoService';
import { useToast } from '../../hooks/useToast';
import CategoriasTable from './CategoriasTable';
import CategoriaFormModal from './CategoriaFormModal';
import ConfirmDialog from '../ui/ConfirmDialog';

function CategoriasPage() {
    const [categorias, setCategorias] = useState([]);
    const [produtos, setProdutos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [categoriaEditando, setCategoriaEditando] = useState(null);
    const [categoriaDeletando, setCategoriaDeletando] = useState(null);

    const toast = useToast();

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            setLoading(true);
            const [dadosCategorias, dadosProdutos] = await Promise.all([getCategorias(), getProdutos()]);
            setCategorias(dadosCategorias);
            setProdutos(dadosProdutos);
        } catch (error) {
            toast.error('Não foi possível carregar os dados. Verifique se a API está rodando.');
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const produtosPorCategoria = (categoriaId) => {
        return produtos.filter((p) => p.categoriaId === categoriaId).length;
    };

    const handleNovo = () => {
        setCategoriaEditando(null);
        setIsFormModalOpen(true);
    };

    const handleEditar = (categoria) => {
        setCategoriaEditando(categoria);
        setIsFormModalOpen(true);
    };

    const handleSalvar = async (categoria) => {
        try {
            if (categoriaEditando) {
                await atualizarCategoria(categoria.id, categoria);
                toast.success('Categoria "{categoria.nome}" atualizada com sucesso!');
            } else {
                await criarCategoria(categoria);
                toast.success('Categoria "{categoria.nome}" criada com sucesso!');
            }
            setIsFormModalOpen(false);
            setCategoriaEditando(null);
            await carregarDados();
        } catch (error) {
            toast.error('Erro ao salvar a categoria.');
            console.error('Erro ao salvar categoria:', error);
        }
    };

    const handleConfirmarDeletar = (categoria) => {
        setCategoriaDeletando(categoria);
        setIsDeleteDialogOpen(true);
    };

    const handleDeletar = async () => {
        try {
            await deletarCategoria(categoriaDeletando.id)
            toast.success('Categoria "{categoriaDeletando.nome}" deletada com sucesso!');
            setIsDeleteDialogOpen(false);
            setCategoriaDeletando(null);
            await carregarDados();
        } catch (error) {
            const mensagemErro = error.response?.data?.mensagemErro || 'Erro ao deletar a categoria.';
            toast.error(mensagemErro);
            setIsDeleteDialogOpen(false);
            console.error('Erro ao deletar categoria:', error);
        }
    };

    return (
        <div className="p-6">
        {/* Header da página — título, contagem e botões */}
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
            {/* Ícone da página */}
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center">
                <Tag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Categorias</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                {/* Texto dinâmico: "1 categoria cadastrada" ou "3 categorias cadastradas" */}
                {categorias.length}{' '}
                {categorias.length === 1 ? 'categoria cadastrada' : 'categorias cadastradas'}
                </p>
            </div>
            </div>

            <div className="flex items-center gap-2">
            {/* Botão recarregar — ícone gira enquanto carrega */}
            <button
                onClick={carregarDados}
                title="Recarregar lista"
                className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            {/* Botão Nova Categoria */}
            <button
                onClick={handleNovo}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
            >
                <Plus className="w-4 h-4" />
                Nova Categoria
            </button>
            </div>
        </div>

        {/* Conteúdo principal — loading ou tabela */}
        {loading ? (
            <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin" />
            <span className="ml-3 text-gray-500 dark:text-gray-400">Carregando categorias...</span>
            </div>
        ) : (
            <CategoriasTable
            categorias={categorias}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onEditar={handleEditar}
            onDeletar={handleConfirmarDeletar}
            produtosPorCategoria={produtosPorCategoria}
            />
        )}

        {/* Modal de formulário (criar/editar) */}
        <CategoriaFormModal
            isOpen={isFormModalOpen}
            onClose={() => {
                setIsFormModalOpen(false);
                setCategoriaEditando(null);
            }}
            categoriaEditando={categoriaEditando}
            onSalvar={handleSalvar}
        />

        {/* Diálogo de confirmação de deleção */}
        <ConfirmDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => {
            setIsDeleteDialogOpen(false);
            setCategoriaDeletando(null);
            }}
            onConfirm={handleDeletar}
            title="Deletar Categoria"
            message={
            categoriaDeletando
                ? `Tem certeza que deseja excluir a categoria "${categoriaDeletando.nome}"? Categorias com produtos associados não podem ser deletadas.`
                : ''
            }
        />
        </div>
    );
  
}

export default CategoriasPage;