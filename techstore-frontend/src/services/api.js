import axios from 'axios';
import { getToken } from './authService';

const api = axios.create({
  baseURL: 'http://localhost:5243/api',
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const mensagensPorStatus = {
  400: 'Requisição inválida — verifique os dados enviados.',
  401: 'Não autorizado — o token pode estar ausente, inválido ou expirado.',
  403: 'Acesso proibido — você não tem permissão para essa ação.',
  404: 'Recurso não encontrado — o endpoint ou registro solicitado não existe.',
  409: 'Conflito — a operação viola uma regra de integridade (ex: exclusão bloqueada).',
  422: 'Dados não processáveis — verifique o formato dos campos enviados.',
  500: 'Erro interno do servidor — verifique o log do backend (dotnet run) para detalhes.',
  502: 'Bad Gateway — o servidor pode estar fora do ar ou inacessível.',
  503: 'Serviço indisponível — o backend pode estar reiniciando ou sobrecarregado.',
};

// Extrai a mensagem de erro do corpo da resposta, cobrindo os DOIS formatos
// que os controllers do backend usam:
// 1. Objeto com propriedade "mensagem": { mensagem: "Categoria não encontrada." }
//    (padrão usado na maioria dos métodos — Produtos, Categorias, NotasFiscais, Itens, Detalhes)
// 2. String pura: "Fornecedor não encontrado."
//    (usado em alguns métodos do FornecedoresController, ex: NotFound("..."), BadRequest("..."))
function extrairMensagemDoBackend(data) {
  if (!data) return null;
  if (typeof data === 'string') return data;
  if (typeof data === 'object' && typeof data.mensagem === 'string') return data.mensagem;
  return null;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const method = error.config?.method?.toUpperCase();

    const mensagemDoBackend = extrairMensagemDoBackend(error.response?.data);

    if (status) {
      const mensagem = mensagemDoBackend || mensagensPorStatus[status] || `Erro HTTP ${status} não mapeado.`;

      console.error(
        `[API ERROR ${status}] ${method} ${url}\n` +
        `Mensagem: ${mensagem}\n` +
        `Resposta completa do servidor:`, error.response?.data
      );
    } else if (error.request) {
      console.error(
        `[API ERROR] ${method} ${url}\n` +
        `Nenhuma resposta recebida do servidor. Verifique se a API está rodando ` +
        `e se não há bloqueio de CORS ou rede.`
      );
    } else {
      console.error(`[API ERROR] Falha ao montar a requisição:`, error.message);
    }

    if (status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;