import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../../services/authService";
import { useTheme } from "../../contexts/ThemeContext";
import { User, Lock, Eye, EyeOff, Monitor, Sun, Moon } from "lucide-react";

export default function RegisterPage() {
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [erro, setErro] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { tema, alternarTema } = useTheme();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setSucesso("");
    try {
      await register(nomeUsuario, senha);
      setSucesso("Cadastro realizado com sucesso! Redirecionando...");
      setTimeout(() => {
        navigate("/login"); // Manda para o login após 2 segundos
      }, 2000);
    } catch (err) {
      setErro(err.response?.data?.mensagem || "Falha ao realizar o cadastro.");
    }
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Botão de alternância de tema */}
      <button
        onClick={alternarTema}
        title={tema === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
        className="absolute top-6 right-6 p-2.5 rounded-lg text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
      >
        {tema === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="w-[450px] bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
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
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Crie sua conta</h2>
            <p className="text-gray-600 dark:text-gray-400">Cadastre um novo usuário administrador.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Usuário */}
            <div className="space-y-2">
              <label className="text-gray-700 dark:text-gray-300 font-medium block">Nome do Usuário</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Ex: joao_admin"
                  value={nomeUsuario}
                  onChange={(e) => setNomeUsuario(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 p-4 pl-12 rounded-lg text-lg focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 focus:border-blue-300 transition-all"
                  required
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div className="space-y-2">
              <label className="text-gray-700 dark:text-gray-300 font-medium block">Senha de Acesso</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Crie uma senha estável"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 p-4 pl-12 pr-12 rounded-lg text-lg focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 focus:border-blue-300 transition-all"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              {erro && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{erro}</p>}
              {sucesso && <p className="text-green-600 dark:text-green-400 text-sm mt-1">{sucesso}</p>}
            </div>

            {/* Botão de Enviar */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white p-4 rounded-lg text-xl font-bold hover:bg-blue-700 transition-all"
              >
                Cadastrar no Sistema
              </button>
            </div>
          </form>

          {/* Links do Rodapé */}
          <div className="pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Já tem uma conta? <Link to="/login" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">Faça Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}