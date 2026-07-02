import { createContext, useContext, useState } from "react";
import { login as loginService, logout as logoutService, isAuthenticated } from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [autenticado, setAutenticado] = useState(isAuthenticated());

  async function login(nomeUsuario, senha) {
    await loginService(nomeUsuario, senha);
    setAutenticado(true);
  }

  function logout() {
    logoutService();
    setAutenticado(false);
  }

  return (
    <AuthContext.Provider value={{ autenticado, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}