import api from './api';

export const notaFiscalService = {
  async listar() {
    const response = await api.get('/notasfiscais');
    return response.data;
  },
  async obterPorId(id) {
    const response = await api.get(`/notasfiscais/${id}`);
    return response.data;
  },
  async cadastrar(notaFiscal) {
    const response = await api.post('/notasfiscais', notaFiscal);
    return response.data;
  },
  async atualizar(id, notaFiscal) {
    const response = await api.put(`/notasfiscais/${id}`, notaFiscal);
    return response.data;
  },
  async deletar(id) {
    const response = await api.delete(`/notasfiscais/${id}`);
    return response.data;
  }
};