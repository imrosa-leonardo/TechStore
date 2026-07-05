import api from './api';

export const detalheProdutoService = {
  // Busca o detalhe de um produto específico. Se não existir, a API retorna 404,
  // e tratamos isso no componente como "ainda não tem detalhe cadastrado".
  async obterPorProduto(produtoId) {
    const response = await api.get(`/DetalhesProduto/produto/${produtoId}`);
    return response.data;
  },
  async cadastrar(detalhe) {
    const response = await api.post('/DetalhesProduto', detalhe);
    return response.data;
  },
  async atualizar(id, detalhe) {
    const response = await api.put(`/DetalhesProduto/${id}`, detalhe);
    return response.data;
  },
  async deletar(id) {
    const response = await api.delete(`/DetalhesProduto/${id}`);
    return response.data;
  }
};