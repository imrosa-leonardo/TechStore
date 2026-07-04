import { Search, Pencil, Trash2, FileText, Package } from 'lucide-react';

function NotaFiscalTable({ notasFiscais, searchTerm, onSearchChange, onEditar, onDeletar, onVerItens }) {

    const notasFiltradas = notasFiscais.filter((n) => {
        const termo = searchTerm.toLowerCase();
        return (
            n.numero.toLowerCase().includes(termo) ||
            (n.fornecedor && n.fornecedor.nome.toLowerCase().includes(termo))
        );
    });

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por número ou fornecedor..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                    />
                </div>
            </div>

            {notasFiltradas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
                    <FileText className="w-12 h-12 mb-3" />
                    <p className="text-sm font-medium">
                        {searchTerm ? 'Nenhuma nota fiscal encontrada.' : 'Nenhuma nota fiscal cadastrada.'}
                    </p>
                </div>
            ) : (
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Número</th>
                            <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Fornecedor</th>
                            <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Emissão</th>
                            <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Valor Total</th>
                            <th className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {notasFiltradas.map((nota) => (
                            <tr key={nota.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="px-6 py-4">
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {nota.numero}{nota.serie ? ` - Série ${nota.serie}` : ''}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">{nota.fornecedor?.nome || '-'}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(nota.dataEmissao).toLocaleDateString('pt-BR')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {nota.valorTotal ? `R$ ${nota.valorTotal.toFixed(2)}` : '-'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => onVerItens(nota)} title="Ver Itens" className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors">
                                            <Package className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => onEditar(nota)} title="Editar Nota Fiscal" className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => onDeletar(nota)} title="Deletar Nota Fiscal" className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default NotaFiscalTable;