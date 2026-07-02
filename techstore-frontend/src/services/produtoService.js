import axios from 'axios';

const API_URL = 'http://localhost:5243/api/produtos';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
});
// Busca todos os produtos = GET
export const getProdutos = async () => {
    const response = await api.get('/');
    return response.data;
};
// Busca um produto por ID = GET
export const getProduto = async (id) => {
    const response = await api.get(`/${id}`);
    return response.data;
};
// Cria um novo produto = POST
export const criarProduto = async (produto) => {
    const response = await api.post('/', produto);
    return response.data;
};
// Atualiza um produto existente = PUT
export const atualizarProduto = async (produto) => {
    const response = await api.put(`/${produto.id}`, produto);
    return response.data;
};
// Deleta um produto por ID = DELETE
export const deletarProduto = async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data;
};