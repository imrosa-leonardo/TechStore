import api from './api';

// Busca todos os produtos = GET
export const getProdutos = async () => {
    const response = await api.get('/produtos');
    return response.data;
};

// Busca um produto por ID = GET
export const getProduto = async (id) => {
    const response = await api.get(`/produtos/${id}`);
    return response.data;
};

// Cria um novo produto = POST
export const criarProduto = async (produto) => {
    const response = await api.post('/produtos', produto);
    return response.data;
};

// Atualiza um produto existente = PUT
export const atualizarProduto = async (produto) => {
    const response = await api.put(`/produtos/${produto.id}`, produto);
    return response.data;
};

// Deleta um produto por ID = DELETE
export const deletarProduto = async (id) => {
    const response = await api.delete(`/produtos/${id}`);
    return response.data;
};