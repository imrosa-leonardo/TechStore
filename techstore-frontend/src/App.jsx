import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProdutosPage from './components/produtos/ProdutosPage';
import CategoriasPage from './components/categorias/CategoriasPage';
import LoginPage from './components/auth/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RegisterPage from './components/auth/RegisterPage';
import FornecedoresPage from './components/fornecedores/FornecedoresPage';
import NotasFiscaisPage from './components/notasFiscais/NotasFiscaisPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registrar" element={<RegisterPage />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/produtos" replace />} />
        <Route path="/produtos" element={<ProdutosPage />} />
        <Route path="/categorias" element={<CategoriasPage />} />
        <Route path="/fornecedores" element={<FornecedoresPage /> } />
        <Route path="/notas-fiscais" element={<NotasFiscaisPage />} />
      </Route>
    </Routes>
  );
}

export default App;