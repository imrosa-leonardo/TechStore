import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { User, Lock, Eye, EyeOff, Monitor } from "lucide-react"; // Importando ícones Lucide
import { Link } from "react-router-dom"; // Importando Link para navegação

export default function LoginPage() {
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Estado para visibilidade da senha
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    try {
      await login(nomeUsuario, senha);
      navigate("/produtos");
    } catch (err) {
      setErro("Usuário ou senha inválidos");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 pattern-bg">
      <div className="w-[450px] bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Cabeçalho Navy */}
        <div className="bg-gray-950 p-10 text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
            <Monitor className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white">TechStore</h1>
          <p className="text-sm text-gray-400">Gerenciador de Estoque</p>
        </div>

        {/* Formulário Principal */}
        <div className="p-10 space-y-8">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Bem-vindo de volta</h2>
            <p className="text-gray-600">Digite seus dados para acessar o sistema.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Usuário */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-gray-700 font-medium block">Nome do Usuário</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={nomeUsuario}
                  onChange={(e) => setNomeUsuario(e.target.value)}
                  className="w-full border border-gray-200 p-4 pl-12 rounded-lg text-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                  required
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div className="space-y-2 relative">
              <label htmlFor="password" className="text-gray-700 font-medium block">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="......"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full border border-gray-200 p-4 pl-12 pr-12 rounded-lg text-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
               {erro && <p className="text-red-500 text-sm mt-1">{erro}</p>}
               <a href="#" className="text-blue-600 text-sm font-medium absolute right-0 -bottom-6">Esqueceu a senha?</a>
            </div>

            {/* Botão de Enviar */}
            <div className="pt-6">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white p-4 rounded-lg text-xl font-bold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all"
              >
                Acessar Sistema
              </button>
            </div>
          </form>

          {/* Links do Rodapé do Card */}
          <div className="pt-6 border-t border-gray-100 text-center space-y-4">
            <p className="text-gray-600">
              Não tem uma conta? <Link to="/registrar" className="text-blue-600 font-medium">Cadastre-se</Link>
            </p>
            <p className="text-gray-600">
              Precisa de ajuda? <a href="#" className="text-blue-600 font-medium">Suporte</a>
            </p>
            <p className="text-[11px] text-gray-400 pt-2">TechStore Info/Company</p>
          </div>
        </div>
      </div>
    </div>
  );
}