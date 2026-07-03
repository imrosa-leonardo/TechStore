import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';

function ProdutoFormModal({ isOpen, onClose, produtoEditando, onSalvar, categorias, fornecedores}) {
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [preco, setPreco] = useState('');
    const [quantidade, setQuantidade] = useState('');
    const [categoriaId, setCategoriaId] = useState('');
    const [fornecedorId, setFornecedorId] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (produtoEditando) {
                setNome(produtoEditando.nome || '');
                setDescricao(produtoEditando.descricao || '');
                setPreco(produtoEditando.preco?.toString() || '');
                setQuantidade(produtoEditando.quantidade?.toString() || '');
                setCategoriaId(produtoEditando.categoriaId?.toString() || '');
                setFornecedorId(produtoEditando.fornecedorId?.toString() || '');
            } else {
                setNome('');
                setDescricao('');
                setPreco('');
                setQuantidade('');
                setCategoriaId('');
                setFornecedorId('');
            }
        }
    }, [isOpen, produtoEditando]);
    
    const handleSubmit = (e) => {
        e.preventDefault();

        const produto = {
            nome, 
            descricao,
            preco: parseFloat(preco),
            quantidade: parseInt(quantidade),
        };

        if (categoriaId) {
            produto.categoriaId = parseInt(categoriaId);
        }

        if (fornecedorId) {
            produto.fornecedorId = parseInt(fornecedorId);
        }

        if (produtoEditando) {
            produto.id = produtoEditando.id;
            produto.dataCriacao = produtoEditando.dataCriacao;
        }
        onSalvar(produto);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={produtoEditando ? 'Editar Produto' : 'Adicionar Produto'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
                    <input
                        id="nome"
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Ex: Nome do jogo"
                        required
                        className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                    />
                </div>

                <div>
                    <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">Descrição <span className="text-gray-400 font-normal">(opcional)</span></label>
                    <input
                        id="descricao"
                        type="text"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        placeholder="Ex: PlayStation 5, ou Monitor OLED."
                        className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                    />
                </div>

                {categorias && categorias.length > 0 && (
                    <div>
                        <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                        <select
                            id="categoria"
                            value={categoriaId}
                            onChange={(e) => setCategoriaId(e.target.value)}
                            required
                            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white"
                        >
                            <option value="">-- Selecione uma categoria --</option>
                            {categorias.map((categoria) => (
                                <option key={categoria.id} value={categoria.id}>
                                    {categoria.nome}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {fornecedores && fornecedores.length > 0 && (
                    <div>
                        <label htmlFor="fornecedor" className="block text-sm font-medium text-gray-700 mb-1">
                            Fornecedor <span className="text-gray-400 font-normal">(opcional)</span>
                        </label>
                        <select
                            id="fornecedor"
                            value={fornecedorId}
                            onChange={(e) => setFornecedorId(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white"
                        >
                            <option value="">-- Selecione um fornecedor --</option>
                            {fornecedores.map((fornecedor) => (
                                <option key={fornecedor.id} value={fornecedor.id}>
                                    {fornecedor.nome}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div>
                    <label htmlFor="preco" className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                    <input
                        id="preco"
                        type="number"
                        step="0.01"
                        min="0"
                        value={preco}
                        onChange={(e) => setPreco(e.target.value)}
                        placeholder="Ex: 99.99"
                        required
                        className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                    />
                </div>

                <div>
                    <label htmlFor="quantidade" className="block text-sm font-medium text-gray-700 mb-1">Quantidade em Estoque</label>
                    <input
                        id="quantidade"
                        type="number"
                        min="0"
                        value={quantidade}
                        onChange={(e) => setQuantidade(e.target.value)}
                        placeholder="Ex: 100"
                        required
                        className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                    />
                </div>

                {/* Ações */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                        {produtoEditando ? 'Salvar Alterações' : 'Adicionar Produto'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}


export default ProdutoFormModal;