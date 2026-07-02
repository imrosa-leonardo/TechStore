import axios from 'axios';

const API_URL = "http://localhost:5243/api/auth"; // ajuste a porta conforme seu backend

export async function login(nomeUsuario, senha) {
  const response = await axios.post(`${API_URL}/login`, {
    nomeUsuario,
    senha,
  });

  localStorage.setItem("token", response.data.token);
  return response.data.token;
}

export function logout() {
  localStorage.removeItem("token");
}

export function getToken() {
  return localStorage.getItem("token");
}

export function isAuthenticated() {
  return !!getToken();
}

export async function register(nomeUsuario, senha) {
  const response = await axios.post(`${API_URL}/registrar`, {
    nomeUsuario,
    senha,
  });
  return response.data; // Retorna a mensagem de sucesso
}