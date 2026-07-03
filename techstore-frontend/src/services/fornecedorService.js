import api from './api';

export const fornecedorService = {
  async listar() {
    const response = await api.get('/fornecedores');
    return response.data;
  },
  async cadastrar(fornecedor) {
    const response = await api.post('/fornecedores', fornecedor);
    return response.data;
  },
  async atualizar(id, fornecedor) {
    const response = await api.put(`/fornecedores/${id}`, fornecedor);
    return response.data;
  },
  async deletar(id) {
    const response = await api.delete(`/fornecedores/${id}`);
    return response.data;
  }
};