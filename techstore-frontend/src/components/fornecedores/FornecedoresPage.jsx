import { useState, useEffect } from 'react';
import { Plus, RefreshCw, Truck } from 'lucide-react';
import { fornecedorService } from '../../services/fornecedorService';
import { notaFiscalService } from '../../services/notaFiscalService';
import { useToast } from '../../hooks/useToast';
import FornecedoresTable from './FornecedoresTable';
import FornecedorFormModal from './FornecedorFormModal';
import ConfirmDialog from '../ui/ConfirmDialog';

function FornecedoresPage() {
    const [fornecedores, setFornecedores] = useState([]);
    const [notasFiscais, setNotasFiscais] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [fornecedorEditando, setFornecedorEditando] = useState(null);
    const [fornecedorDeletando, setFornecedorDeletando] = useState(null);

    const toast = useToast();

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            setLoading(true);
            const [dadosFornecedores, dadosNotasFiscais] = await Promise.all([
                fornecedorService.listar(),
                notaFiscalService.listar().catch(() => []),
            ]);
            setFornecedores(dadosFornecedores);
            setNotasFiscais(dadosNotasFiscais);
        } catch (error) {
            toast.error('Não foi possível carregar os fornecedores. Verifique se a API está rodando.');
            console.error('Erro ao carregar fornecedores:', error);
        } finally {
            setLoading(false);
        }
    };

    const notasFiscaisPorFornecedor = (fornecedorId) => {
        return notasFiscais.filter((n) => n.fornecedorId === fornecedorId).length;
    };

    const handleNovo = () => {
        setFornecedorEditando(null);
        setIsFormModalOpen(true);
    };

    const handleEditar = (fornecedor) => {
        setFornecedorEditando(fornecedor);
        setIsFormModalOpen(true);
    };

    const handleSucessoFormulario = async () => {
        setIsFormModalOpen(false);
        toast.success(
            fornecedorEditando
                ? `Fornecedor "${fornecedorEditando.nome}" atualizado com sucesso!`
                : 'Fornecedor cadastrado com sucesso!'
        );
        setFornecedorEditando(null);
        await carregarDados();
    };

    const handleConfirmarDeletar = (fornecedor) => {
        setFornecedorDeletando(fornecedor);
        setIsDeleteDialogOpen(true);
    };

    const handleDeletar = async () => {
        try {
            await fornecedorService.deletar(fornecedorDeletando.id);
            toast.success(`Fornecedor "${fornecedorDeletando.nome}" removido com sucesso!`);
            setIsDeleteDialogOpen(false);
            setFornecedorDeletando(null);
            await carregarDados();
        } catch (error) {
            const mensagemErro = error.response?.data || 'Erro ao remover fornecedor. Verifique se ele possui notas fiscais vinculadas.';
            toast.error(mensagemErro);
            setIsDeleteDialogOpen(false);
            console.error('Erro ao deletar fornecedor:', error);
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/40 rounded-lg flex items-center justify-center">
                        <Truck className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Fornecedores</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {fornecedores.length}{' '}
                            {fornecedores.length === 1 ? 'fornecedor cadastrado' : 'fornecedores cadastrados'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={carregarDados}
                        title="Recarregar lista"
                        className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={handleNovo}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Novo Fornecedor
                    </button>
                </div>
            </div>

            {/* Loading ou tabela */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <RefreshCw className="w-6 h-6 text-orange-500 animate-spin" />
                    <span className="ml-3 text-gray-500 dark:text-gray-400">Carregando fornecedores...</span>
                </div>
            ) : (
                <FornecedoresTable
                    fornecedores={fornecedores}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onEditar={handleEditar}
                    onDeletar={handleConfirmarDeletar}
                    notasFiscaisPorFornecedor={notasFiscaisPorFornecedor}
                />
            )}

            {/* Modal de formulário (criar/editar) */}
            <FornecedorFormModal
                isOpen={isFormModalOpen}
                onClose={() => {
                    setIsFormModalOpen(false);
                    setFornecedorEditando(null);
                }}
                onSuccess={handleSucessoFormulario}
                fornecedor={fornecedorEditando}
            />

            {/* Diálogo de confirmação de exclusão */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setFornecedorDeletando(null);
                }}
                onConfirm={handleDeletar}
                title="Deletar Fornecedor"
                message={
                    fornecedorDeletando
                        ? `Tem certeza que deseja excluir o fornecedor "${fornecedorDeletando.nome}"? Fornecedores com notas fiscais associadas não podem ser deletados.`
                        : ''
                }
            />
        </div>
    );
}

export default FornecedoresPage;