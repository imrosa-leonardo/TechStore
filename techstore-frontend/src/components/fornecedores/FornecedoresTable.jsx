import { Search, Pencil, Trash2, Truck } from 'lucide-react';

function FornecedoresTable({ fornecedores, searchTerm, onSearchChange, onEditar, onDeletar, notasFiscaisPorFornecedor }) {
    const fornecedoresFiltrados = fornecedores.filter((f) => {
        const termo = searchTerm.toLowerCase();
        return (
            f.nome.toLowerCase().includes(termo) ||
            (f.contato && f.contato.toLowerCase().includes(termo))
        );
    });

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Campo de Busca */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou contato..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                    />
                </div>
            </div>

            {fornecedoresFiltrados.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
                    <Truck className="w-12 h-12 mb-3" />
                    <p className="text-sm font-medium">
                        {searchTerm ? 'Nenhum fornecedor encontrado.' : 'Nenhum fornecedor cadastrado.'}
                    </p>
                </div>
            ) : (
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Nome</th>
                            <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Contato</th>
                            <th className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Notas Fiscais</th>
                            <th className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {fornecedoresFiltrados.map((fornecedor) => (
                            <tr key={fornecedor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <span className="text-orange-700 dark:text-orange-400 text-xs font-bold">
                                                {fornecedor.nome.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{fornecedor.nome}</span>
                                    </div>
                                </td>

                                <td className="px-6 py-4">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">{fornecedor.contato || '-'}</span>
                                </td>

                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">
                                        {notasFiscaisPorFornecedor ? notasFiscaisPorFornecedor(fornecedor.id) : 0} notas
                                    </span>
                                </td>

                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => onEditar(fornecedor)}
                                            title="Editar Fornecedor"
                                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onDeletar(fornecedor)}
                                            title="Deletar Fornecedor"
                                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                        >
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

export default FornecedoresTable;