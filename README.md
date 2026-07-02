# TechStore
TechStore - Seu estoque Descomplicado

# TechStore

Sistema de gerenciamento de estoque com cadastro de produtos, categorias e fornecedores, além de autenticação de usuários. Composto por uma API em .NET e um frontend em React.

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
- Axios
- Tailwind CSS
- Lucide React (ícones)

## Funcionalidades

- **Autenticação**: login com usuário e senha, sessão via token JWT, rotas protegidas
- **Produtos**: cadastro, edição, exclusão e listagem, com busca por nome/descrição
- **Categorias**: cadastro, edição e exclusão, vinculadas aos produtos
- **Fornecedores**: cadastro, edição e exclusão, vinculados opcionalmente aos produtos
- **Detalhe do Produto**: informações complementares de cada produto (relação um-para-um)
- **Notificações (Toast)**: feedback visual de sucesso/erro nas operações

## Modelo de dados

```
Categoria (1) ────< (N) Produto (N) >──── (1) Fornecedor [opcional]
                          │
                          │ (1:1)
                          ▼
                    DetalheProduto

Usuario (entidade isolada, usada apenas para autenticação)
```

- Um produto pertence a **uma categoria** (obrigatório)
- Um produto pode ter **um fornecedor** (opcional)
- Um produto possui **um detalhe** (opcional, exclusão em cascata)
- Categorias e fornecedores não podem ser excluídos se houver produtos vinculados

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
        │   ├── ui/                 # Modais, Toasts e Confirmações
        │   ├── fornecedores/       # Página, fornecedores e modal de fornecedor
        │   └── layout/             # Layout, Sidebar
        ├── contexts/
        │   ├── AuthContext.jsx
        │   └── ToastContext.jsx
        ├── services/               # Chamadas à API (Axios)
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

## Modelo de dados

O sistema é composto por cinco entidades principais: **Categoria**, **Produto**, **Fornecedor**, **DetalheProduto** e **Usuario**.

### Categoria

Representa a classificação de um produto (ex: Jogos, Monitores). Cada categoria pode estar associada a vários produtos, mas não pode ser excluída enquanto houver produtos vinculados a ela.

- `Id` (chave primária)
- `Nome`
- `Descricao`

**Relacionamento**: um-para-muitos com Produto (`Categoria 1 — N Produto`), obrigatório.

### Fornecedor

Representa o parceiro ou distribuidor responsável por fornecer um produto. Um fornecedor pode estar vinculado a vários produtos, mas não pode ser excluído enquanto houver produtos associados.

- `Id` (chave primária)
- `Nome`
- `Contato`

**Relacionamento**: um-para-muitos com Produto (`Fornecedor 1 — N Produto`), opcional — um produto pode não ter fornecedor definido.

### Produto

Entidade central do sistema. Cada produto pertence a uma categoria, pode ter um fornecedor e possui um detalhe complementar.

- `Id` (chave primária)
- `Nome`
- `Descricao`
- `Preco`
- `Quantidade`
- `DataCriacao`
- `CategoriaId` (chave estrangeira, obrigatória)
- `FornecedorId` (chave estrangeira, opcional)

**Relacionamentos**:
- Muitos-para-um com Categoria (obrigatório)
- Muitos-para-um com Fornecedor (opcional)
- Um-para-um com DetalheProduto

### DetalheProduto

Armazena informações complementares de um produto específico. Cada produto possui no máximo um detalhe, e a exclusão do produto remove automaticamente seu detalhe associado.

- `Id` (chave primária)
- `ProdutoId` (chave estrangeira, única)

**Relacionamento**: um-para-um com Produto, com exclusão em cascata.

### Usuario

Entidade isolada, sem relacionamento com as demais, utilizada exclusivamente para autenticação no sistema.

- `Id` (chave primária)
- `NomeUsuario`
- `SenhaHash` (senha armazenada com hash via BCrypt)

### Regras de integridade

- Um produto **não pode existir sem categoria**, mas pode existir sem fornecedor
- Excluir uma **categoria** ou **fornecedor** com produtos vinculados é bloqueado pelo banco (`DeleteBehavior.Restrict`)
- Excluir um **produto** remove automaticamente seu `DetalheProduto` correspondente (`DeleteBehavior.Cascade`)

A API sobe por padrão em `https://localhost:5243` (ajuste conforme seu `launchSettings.json`).

### Criando o primeiro usuário

Página de cadastro existente no momento que a aplicação roda. Só cadastrar nome e senha.

```sql
INSERT INTO "Usuarios" ("NomeUsuario", "SenhaHash")
VALUES ('admin', '<hash_gerado_com_bcrypt>');
```

### Frontend

```bash
cd techstore-frontend
npm install
npm run dev
```

O frontend sobe por padrão em `http://localhost:5173`.

## Autenticação

O login é feito via `POST /api/auth/login`, retornando um token JWT que é armazenado no `localStorage` e enviado automaticamente nas requisições autenticadas. Rotas do frontend são protegidas por um componente `ProtectedRoute`, que redireciona para `/login` caso não haja token válido.

## Licença

Projeto de uso educacional/pessoal.