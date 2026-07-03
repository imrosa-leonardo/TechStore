import api from './api';

export const getCategorias = async () => {
    const response = await api.get('/categorias');
    return response.data;
};

export const getCategoria = async (id) => {
    const response = await api.get(`/categorias/${id}`);
    return response.data;
};

export const criarCategoria = async (categoria) => {
    const response = await api.post('/categorias', categoria);
    return response.data;
};

export const atualizarCategoria = async (id, categoria) => {
    const response = await api.put(`/categorias/${id}`, categoria);
    return response.data;
};

export const deletarCategoria = async (id) => {
    const response = await api.delete(`/categorias/${id}`);
    return response.data;
};