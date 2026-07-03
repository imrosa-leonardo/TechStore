# TechStore

TechStore - Seu estoque descomplicado.

Sistema de gerenciamento de estoque com cadastro de produtos, categorias e fornecedores, com autenticação de usuários e **isolamento de dados por conta** — cada usuário só acessa os próprios registros. Composto por uma API em .NET e um frontend em React.

## Stack utilizada

**Backend**
- .NET 8 (ASP.NET Core Web API)
- Entity Framework Core
- PostgreSQL (via Npgsql)
- JWT Bearer para autenticação
- BCrypt.Net para hash de senhas
- Swagger / OpenAPI

**Frontend**
- React + Vite
- React Router DOM
- Axios (com interceptor de autenticação)
- Tailwind CSS
- Lucide React (ícones)

## Funcionalidades

- **Autenticação**: cadastro e login de usuários, sessão via token JWT, rotas protegidas no frontend e nos endpoints
- **Isolamento por usuário**: cada conta enxerga e manipula apenas seus próprios produtos, categorias e fornecedores
- **Produtos**: cadastro, edição, exclusão e listagem, com busca por nome/descrição
- **Categorias**: cadastro, edição e exclusão, vinculadas aos produtos
- **Fornecedores**: cadastro, edição e exclusão, vinculados opcionalmente aos produtos
- **Detalhe do Produto**: informações complementares de cada produto (relação um-para-um)
- **Notificações (Toast)**: feedback visual de sucesso/erro nas operações

## Modelo de dados

O sistema é composto por cinco entidades principais: **Usuario**, **Categoria**, **Produto**, **Fornecedor** e **DetalheProduto**. Categoria, Produto e Fornecedor pertencem sempre a um usuário — é essa ligação que garante o isolamento dos dados entre contas diferentes.

### Usuario

Responsável pela autenticação e pela posse dos demais registros do sistema.

- `Id` (chave primária)
- `NomeUsuario`
- `SenhaHash` (senha armazenada com hash via BCrypt)

**Relacionamento**: um usuário pode ter muitas Categorias, muitos Produtos e muitos Fornecedores.

### Categoria

Representa a classificação de um produto (ex: Jogos, Monitores). Pertence a um único usuário e não pode ser excluída enquanto houver produtos vinculados a ela.

- `Id` (chave primária)
- `Nome`
- `Descricao`
- `UsuarioId` (chave estrangeira, obrigatória)

**Relacionamentos**:
- Muitos-para-um com Usuario (dono do registro)
- Um-para-muitos com Produto

### Fornecedor

Representa o parceiro ou distribuidor responsável por fornecer um produto. Pertence a um único usuário e não pode ser excluído enquanto houver produtos associados.

- `Id` (chave primária)
- `Nome`
- `Contato`
- `UsuarioId` (chave estrangeira, obrigatória)

**Relacionamentos**:
- Muitos-para-um com Usuario (dono do registro)
- Um-para-muitos com Produto, opcional — um produto pode não ter fornecedor definido

### Produto

Entidade central do sistema. Pertence a um único usuário, uma categoria, pode ter um fornecedor e possui um detalhe complementar.

- `Id` (chave primária)
- `Nome`
- `Descricao`
- `Preco`
- `Quantidade`
- `DataCriacao`
- `CategoriaId` (chave estrangeira, obrigatória)
- `FornecedorId` (chave estrangeira, opcional)
- `UsuarioId` (chave estrangeira, obrigatória)

**Relacionamentos**:
- Muitos-para-um com Usuario (dono do registro)
- Muitos-para-um com Categoria (obrigatório)
- Muitos-para-um com Fornecedor (opcional)
- Um-para-um com DetalheProduto

### DetalheProduto

Armazena informações complementares de um produto específico. Não possui vínculo direto com Usuario — sua proteção é feita indiretamente, através do produto ao qual pertence. Cada produto possui no máximo um detalhe, e a exclusão do produto remove automaticamente seu detalhe associado.

- `Id` (chave primária)
- `Especificacoes`
- `Garantia`
- `PaisDeOrigem`
- `PesoGramas`
- `ProdutoId` (chave estrangeira, única)

**Relacionamento**: um-para-um com Produto, com exclusão em cascata.

### Regras de integridade

- Um produto **não pode existir sem categoria**, mas pode existir sem fornecedor
- Excluir uma **categoria** ou **fornecedor** com produtos vinculados é bloqueado pelo banco (`DeleteBehavior.Restrict`)
- Excluir um **produto** remove automaticamente seu `DetalheProduto` correspondente (`DeleteBehavior.Cascade`)
- Todo endpoint de Produtos, Categorias, Fornecedores e Detalhes exige autenticação (`[Authorize]`) e filtra os resultados pelo usuário logado

## Estrutura do projeto

```
TechStore/
├── TechStore.Api/                 # Backend (.NET)
│   ├── Controllers/
│   │   ├── AuthController.cs
│   │   ├── ProdutosController.cs
│   │   ├── DetalhesProdutoController.cs
│   │   ├── CategoriasController.cs
│   │   └── FornecedoresController.cs
│   ├── Data/
│   │   └── AppDbContext.cs
│   ├── Models/
│   │   ├── Produto.cs
│   │   ├── Categoria.cs
│   │   ├── Fornecedor.cs
│   │   ├── DetalheProduto.cs
│   │   └── Usuario.cs
│   └── Program.cs
│
└── techstore-frontend/            # Frontend (React)
    └── src/
        ├── components/
        │   ├── auth/               # LoginPage, ProtectedRoute
        │   ├── produtos/           # Página, tabela, modais de produto
        │   ├── categorias/         # Página, tabela, modal de categoria
        │   ├── fornecedores/       # Página, tabela e modal de fornecedor
        │   ├── ui/                 # Modais, Toasts e Confirmações
        │   └── layout/             # Layout, Sidebar
        ├── contexts/
        │   ├── AuthContext.jsx
        │   └── ToastContext.jsx
        ├── services/               # Chamadas à API (Axios)
        │   ├── api.js              # Instância Axios com interceptor de token
        │   ├── authService.js
        │   ├── produtoService.js
        │   ├── categoriaService.js
        │   └── fornecedorService.js
        ├── App.jsx
        └── main.jsx
```

## Como rodar o projeto

### Pré-requisitos

- .NET 8 SDK
- Node.js 18+
- PostgreSQL

### Backend

```bash
cd TechStore.Api
dotnet restore
```

Configure a connection string no `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=techstoredb;Username=seu_usuario;Password=sua_senha"
  }
}
```

Aplique as migrations:

```bash
dotnet ef database update
```

Rode a API:

```bash
dotnet run
```

A API sobe por padrão em `https://localhost:5243` (ajuste conforme seu `launchSettings.json`).

### Criando o primeiro usuário

Diferente de versões anteriores do projeto, não é mais necessário inserir usuários manualmente no banco. Basta acessar a tela de cadastro da aplicação (ou o endpoint `POST /api/auth/registrar` via Swagger) informando nome de usuário e senha:

```json
POST /api/auth/registrar
{
  "nomeUsuario": "admin",
  "senha": "minhasenha123"
}
```

A senha é automaticamente criptografada com BCrypt antes de ser salva.

### Frontend

```bash
cd techstore-frontend
npm install
npm run dev
```

O frontend sobe por padrão em `http://localhost:5173`.

## Autenticação

O login é feito via `POST /api/auth/login`, retornando um token JWT que é armazenado no `localStorage`. O token carrega o `Id` do usuário como claim (`NameIdentifier`), usado pelo backend para filtrar automaticamente os dados de cada requisição.

No frontend, uma instância única do Axios (`services/api.js`) intercepta toda requisição para anexar o token no cabeçalho `Authorization`, e redireciona para `/login` automaticamente caso a API responda com `401`. Rotas do frontend também são protegidas por um componente `ProtectedRoute`, que impede o acesso às páginas internas sem um token válido.

## Licença

Projeto de uso educacional/pessoal.