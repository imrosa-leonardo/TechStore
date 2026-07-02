import React, { useState, useEffect } from 'react';
import { fornecedorService } from '../../services/fornecedorService';
import FornecedorFormModal from './FornecedorFormModal';
import { Pencil, Trash2 } from 'lucide-react'; // Ícones usados no seu projeto

export default function FornecedoresPage() {
  const [fornecedores, setFornecedores] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);

  const carregarFornecedores = async () => {
    try {
      const dados = await fornecedorService.listar();
      setFornecedores(dados);
    } catch (error) {
      console.error("Erro ao buscar fornecedores", error);
    }
  };

  useEffect(() => {
    carregarFornecedores();
  }, []);

  const handleAbrirCadastro = () => {
    setFornecedorSelecionado(null);
    setIsModalOpen(true);
  };

  const handleAbrirEdicao = (fornecedor) => {
    setFornecedorSelecionado(fornecedor);
    setIsModalOpen(true);
  };

  const handleDeletar = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja remover o fornecedor "${nome}"?`)) {
      try {
        await fornecedorService.deletar(id);
        carregarFornecedores();
      } catch (error) {
        alert(error.response?.data || "Erro ao deletar fornecedor. Verifique se ele possui produtos vinculados.");
      }
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Fornecedores</h1>
          <p className="text-gray-500">Gerencie os parceiros e distribuidores da sua loja.</p>
        </div>
        <button
          onClick={handleAbrirCadastro}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm flex items-center gap-2 shadow-sm"
        >
          <span>+</span> Novo Fornecedor
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm font-medium">
              <th className="p-4">ID</th>
              <th className="p-4">Nome</th>
              <th className="p-4">Contato</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm">
            {fornecedores.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-400">
                  Nenhum fornecedor cadastrado ainda.
                </td>
              </tr>
            ) : (
              fornecedores.map((f) => (
                <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-mono text-gray-400">#{f.id}</td>
                  <td className="p-4 font-medium text-gray-900">{f.nome}</td>
                  <td className="p-4 text-gray-500">{f.contato}</td>
                  <td className="p-4 flex justify-center gap-3">
                    <button
                      onClick={() => handleAbrirEdicao(f)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletar(f.id, f.nome)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Deletar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <FornecedorFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={carregarFornecedores}
        fornecedor={fornecedorSelecionado}
      />
    </div>
  );
}