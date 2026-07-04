import { useState, useEffect } from 'react';
import { Plus, RefreshCw, FileText } from 'lucide-react';
import { notaFiscalService } from '../../services/notaFiscalService';
import { useToast } from '../../hooks/useToast';
import NotaFiscalTable from './NotaFiscalTable';
import NotaFiscalFormModal from './NotaFiscalFormModal';
import ItensNotaFiscalModal from './ItensNotaFiscalModal';
import ConfirmDialog from '../ui/ConfirmDialog';

function NotasFiscaisPage() {
    const [notasFiscais, setNotasFiscais] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isItensModalOpen, setIsItensModalOpen] = useState(false);
    const [notaEditando, setNotaEditando] = useState(null);
    const [notaDeletando, setNotaDeletando] = useState(null);
    const [notaSelecionada, setNotaSelecionada] = useState(null);

    const toast = useToast();

    useEffect(() => {
        carregarNotasFiscais();
    }, []);

    const carregarNotasFiscais = async () => {
        try {
            setLoading(true);
            const dados = await notaFiscalService.listar();
            setNotasFiscais(dados);
        } catch (error) {
            toast.error('Não foi possível carregar as notas fiscais.');
            console.error('Erro ao carregar notas fiscais:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNovo = () => {
        setNotaEditando(null);
        setIsFormModalOpen(true);
    };

    const handleEditar = (nota) => {
        setNotaEditando(nota);
        setIsFormModalOpen(true);
    };

    const handleVerItens = (nota) => {
        setNotaSelecionada(nota);
        setIsItensModalOpen(true);
    };

    const handleSucessoFormulario = async () => {
        toast.success(notaEditando ? 'Nota fiscal atualizada com sucesso!' : 'Nota fiscal cadastrada com sucesso!');
        setIsFormModalOpen(false);
        setNotaEditando(null);
        await carregarNotasFiscais();
    };

    const handleConfirmarDeletar = (nota) => {
        setNotaDeletando(nota);
        setIsDeleteDialogOpen(true);
    };

    const handleDeletar = async () => {
        try {
            await notaFiscalService.deletar(notaDeletando.id);
            toast.success(`Nota fiscal "${notaDeletando.numero}" removida com sucesso!`);
            setIsDeleteDialogOpen(false);
            setNotaDeletando(null);
            await carregarNotasFiscais();
        } catch (error) {
            toast.error('Erro ao remover nota fiscal. Verifique se ela possui itens vinculados.');
            setIsDeleteDialogOpen(false);
            console.error('Erro ao deletar nota fiscal:', error);
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Notas Fiscais</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {notasFiscais.length}{' '}
                            {notasFiscais.length === 1 ? 'nota fiscal cadastrada' : 'notas fiscais cadastradas'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={carregarNotasFiscais} title="Recarregar lista" className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={handleNovo} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-sm">
                        <Plus className="w-4 h-4" />
                        Nova Nota Fiscal
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <RefreshCw className="w-6 h-6 text-purple-500 animate-spin" />
                    <span className="ml-3 text-gray-500 dark:text-gray-400">Carregando notas fiscais...</span>
                </div>
            ) : (
                <NotaFiscalTable
                    notasFiscais={notasFiscais}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onEditar={handleEditar}
                    onDeletar={handleConfirmarDeletar}
                    onVerItens={handleVerItens}
                />
            )}

            <NotaFiscalFormModal
                isOpen={isFormModalOpen}
                onClose={() => {
                    setIsFormModalOpen(false);
                    setNotaEditando(null);
                }}
                onSuccess={handleSucessoFormulario}
                notaFiscal={notaEditando}
            />

            <ItensNotaFiscalModal
                isOpen={isItensModalOpen}
                onClose={() => {
                    setIsItensModalOpen(false);
                    setNotaSelecionada(null);
                }}
                notaFiscal={notaSelecionada}
            />

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setNotaDeletando(null);
                }}
                onConfirm={handleDeletar}
                title="Deletar Nota Fiscal"
                message={
                    notaDeletando
                        ? `Tem certeza que deseja excluir a nota fiscal "${notaDeletando.numero}"? Todos os itens vinculados a ela também serão removidos.`
                        : ''
                }
            />
        </div>
    );
}

export default NotasFiscaisPage;