import api from './api';

export const itemNotaFiscalService = {
  async listarPorNota(notaFiscalId) {
    const response = await api.get(`/itensnotafiscal?notaFiscalId=${notaFiscalId}`);
    return response.data;
  },
  async cadastrar(item) {
    const response = await api.post('/itensnotafiscal', item);
    return response.data;
  },
  async atualizar(id, item) {
    const response = await api.put(`/itensnotafiscal/${id}`, item);
    return response.data;
  },
  async deletar(id) {
    const response = await api.delete(`/itensnotafiscal/${id}`);
    return response.data;
  }
};