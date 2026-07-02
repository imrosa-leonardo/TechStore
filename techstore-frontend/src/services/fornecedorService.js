import axios from 'axios';

const API_URL = "http://localhost:5243/api/fornecedores"; 

export const fornecedorService = {
  async listar() {
    const response = await axios.get(API_URL);
    return response.data;
  },
  async cadastrar(fornecedor) {
    const response = await axios.post(API_URL, fornecedor);
    return response.data;
  },
  async atualizar(id, fornecedor) {
    const response = await axios.put(`${API_URL}/${id}`, fornecedor);
    return response.data;
  },
  async deletar(id) {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  }
};