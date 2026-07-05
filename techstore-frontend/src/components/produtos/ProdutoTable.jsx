import { Search, Pencil, Trash2, PackageOpen, Info } from 'lucide-react';

function ProdutoTable({ produtos, searchTerm, onSearchChange, onEditar, onDeletar, onVerDetalhe, onVisualizar }) {
    const produtosFiltrados = produtos.filter((p) => {
        const termo = searchTerm.toLowerCase();
        return (
            p.nome.toLowerCase().includes(termo) ||
            (p.descricao && p.categoria.nome.toLowerCase().includes(termo))
        );
    });

    return(
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou descrição..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                    />
                </div>
            </div>
            {/* Table */}
            {produtosFiltrados.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
                    <PackageOpen className="w-12 h-12 mb-3" />
                    <p className="text-sm font-medium">
                        {searchTerm 
                        ? 'Nenhum produto encontrado para sua busca.' 
                        : 'Nenhum produto cadastrado.'}
                    </p>
                </div>
            ) : (
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Nome</th>
                            <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Descrição</th>
                            <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Categoria</th>
                            <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Nota Fiscal</th>
                            <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Preço</th>
                            <th className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Estoque</th>
                            <th className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {produtosFiltrados.map((produto) => (
                            <tr key={produto.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => onVisualizar(produto)}
                                        className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors text-left">
                                        {produto.nome}
                                    </button>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">{produto.descricao || '-'}</span>
                                </td>

                                <td className="px-6 py-4">
                                    {produto.categoria ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rouneded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                                            {produto.categoria.nome}
                                        </span>
                                    ) : (
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Sem Categoria</span>
                                    )}
                                </td>

                                
                                
                                <td className="px-6 py-4 text-right">
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100"> R$ {produto.preco.toFixed(2)} </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${produto.quantidade > 10 ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' : produto.quantidade > 0 ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300' : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'}`}
                                    >
                                        {produto.quantidade} un.
                                    </span>   
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => onEditar(produto)} title="Editar Produto" className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => onVerDetalhe(produto)} title="Detalhes do Produto" className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors">
                                            <Info className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => onDeletar(produto)} title="Deletar Produto" className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
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

export default ProdutoTable;