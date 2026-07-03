import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { fornecedorService } from '../../services/fornecedorService';

export default function FornecedorFormModal({ isOpen, onClose, onSuccess, fornecedor }) {
  const [nome, setNome] = useState('');
  const [contato, setContato] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Monitora se o modal abriu para cadastro ou edição
  useEffect(() => {
    if (fornecedor) {
      setNome(fornecedor.nome);
      setContato(fornecedor.contato);
    } else {
      setNome('');
      setContato('');
    }
    setErro('');
  }, [fornecedor, isOpen]);

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!nome || !contato) return;

    setCarregando(true);
    setErro('');

    try {
      if (fornecedor) {
        // Modo Edição
        await fornecedorService.atualizar(fornecedor.id, { id: fornecedor.id, nome, contato });
      } else {
        // Modo Cadastro
        await fornecedorService.cadastrar({ nome, contato });
      }
      onSuccess();
      onClose();
    } catch (error) {
      setErro(error.response?.data || 'Erro ao salvar fornecedor. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={fornecedor ? "Editar Fornecedor" : "Cadastrar Novo Fornecedor"} size="md">
      <form onSubmit={handleSalvar} className="space-y-4">
        {erro && (
          <div className="p-3 rounded text-sm bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300">
            {erro}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Nome da Empresa</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Distribuidora Tech"
            className="w-full p-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Contato (E-mail/Telefone)</label>
          <input
            type="text"
            value={contato}
            onChange={(e) => setContato(e.target.value)}
            placeholder="Ex: contato@tech.com"
            className="w-full p-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={carregando}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:bg-blue-400 dark:disabled:bg-blue-800"
          >
            {carregando ? 'Salvando...' : 'Salvar Fornecedor'}
          </button>
        </div>
      </form>
    </Modal>
  );
}