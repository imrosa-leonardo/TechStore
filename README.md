# TechStore

TechStore - Seu estoque descomplicado.

Sistema de gerenciamento de estoque com cadastro de produtos, categorias, fornecedores e notas fiscais, com autenticação de usuários e **isolamento de dados por conta** — cada usuário só acessa os próprios registros. Composto por uma API em .NET e um frontend em React.

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
- Tailwind CSS v4 (com suporte a modo claro/escuro)
- Lucide React (ícones)

## Funcionalidades

- **Autenticação**: cadastro e login de usuários, sessão via token JWT, rotas protegidas no frontend e nos endpoints
- **Isolamento por usuário**: cada conta enxerga e manipula apenas seus próprios produtos, categorias, fornecedores e notas fiscais
- **Modo claro/escuro**: alternância de tema persistida entre sessões, disponível em todas as telas (incluindo login e cadastro)
- **Produtos**: cadastro, edição, exclusão e listagem, com busca por nome/descrição
- **Categorias**: cadastro, edição e exclusão, vinculadas aos produtos
- **Fornecedores**: cadastro, edição e exclusão, vinculados às notas fiscais
- **Notas Fiscais**: cadastro de notas por fornecedor, com itens (produtos, quantidade e valor unitário) e valor total calculado automaticamente a partir dos itens
- **Detalhe do Produto**: informações complementares de cada produto (relação um-para-um)
- **Notificações (Toast)**: feedback visual de sucesso/erro nas operações

## Modelo de dados

O sistema é composto por sete entidades principais: **Usuario**, **Categoria**, **Produto**, **Fornecedor**, **NotaFiscal**, **ItemNotaFiscal** e **DetalheProduto**. Categoria, Produto, Fornecedor e NotaFiscal pertencem sempre a um usuário — é essa ligação que garante o isolamento dos dados entre contas diferentes.

### Usuario

Responsável pela autenticação e pela posse dos demais registros do sistema.

- `Id` (chave primária)
- `NomeUsuario`
- `SenhaHash` (senha armazenada com hash via BCrypt)

**Relacionamento**: um usuário pode ter muitas Categorias, muitos Produtos, muitos Fornecedores e muitas Notas Fiscais.

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

Representa o parceiro ou distribuidor responsável por emitir notas fiscais. Pertence a um único usuário e não pode ser excluído enquanto houver notas fiscais associadas. Não possui mais vínculo direto com Produto — a ligação passa a existir através das notas fiscais.

- `Id` (chave primária)
- `Nome`
- `Contato`
- `UsuarioId` (chave estrangeira, obrigatória)

**Relacionamentos**:
- Muitos-para-um com Usuario (dono do registro)
- Um-para-muitos com NotaFiscal

### NotaFiscal

Representa uma nota fiscal emitida por um fornecedor. Reúne um ou mais itens, cada um referenciando um produto, sua quantidade e valor unitário naquela compra específica.

- `Id` (chave primária)
- `Numero`
- `Serie` (opcional)
- `DataEmissao`
- `FornecedorId` (chave estrangeira, obrigatória)
- `UsuarioId` (chave estrangeira, obrigatória)
- `ValorTotal` — **propriedade calculada**, não persistida no banco; soma de `Quantidade × ValorUnitario` de todos os itens da nota

**Relacionamentos**:
- Muitos-para-um com Usuario (dono do registro)
- Muitos-para-um com Fornecedor
- Um-para-muitos com ItemNotaFiscal (exclusão em cascata: remover a nota remove seus itens)

### ItemNotaFiscal

Representa um produto específico dentro de uma nota fiscal, com a quantidade e o valor unitário daquela compra. Um mesmo produto pode aparecer em várias notas fiscais diferentes ao longo do tempo, cada uma com seus próprios valores.

- `Id` (chave primária)
- `NotaFiscalId` (chave estrangeira, obrigatória)
- `ProdutoId` (chave estrangeira, obrigatória)
- `Quantidade`
- `ValorUnitario`
- `ValorTotal` — propriedade calculada (`Quantidade × ValorUnitario`), não persistida no banco

**Relacionamentos**:
- Muitos-para-um com NotaFiscal (cascata na exclusão)
- Muitos-para-um com Produto (não é possível excluir um produto com itens de nota fiscal vinculados)

### Produto

Entidade central do sistema. Pertence a um único usuário, uma categoria, possui um detalhe complementar e um histórico de itens de notas fiscais.

- `Id` (chave primária)
- `Nome`
- `Descricao`
- `Preco`
- `Quantidade`
- `DataCriacao`
- `CategoriaId` (chave estrangeira, obrigatória)
- `UsuarioId` (chave estrangeira, obrigatória)

**Relacionamentos**:
- Muitos-para-um com Usuario (dono do registro)
- Muitos-para-um com Categoria (obrigatório)
- Um-para-um com DetalheProduto
- Um-para-muitos com ItemNotaFiscal (histórico de compras/entradas)

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

- Um produto **não pode existir sem categoria**
- Excluir uma **categoria** com produtos vinculados é bloqueado pelo banco (`DeleteBehavior.Restrict`)
- Excluir um **fornecedor** com notas fiscais vinculadas é bloqueado pelo banco
- Excluir um **produto** com itens de nota fiscal vinculados é bloqueado pelo banco
- Excluir uma **nota fiscal** remove automaticamente seus itens (`DeleteBehavior.Cascade`)
- Excluir um **produto** remove automaticamente seu `DetalheProduto` correspondente (`DeleteBehavior.Cascade`)
- Todo campo `DateTime` é tratado como UTC antes de ser salvo no PostgreSQL, via conversão global configurada no `AppDbContext`
- Todo endpoint de Produtos, Categorias, Fornecedores, Notas Fiscais, Itens e Detalhes exige autenticação (`[Authorize]`) e filtra os resultados pelo usuário logado

## Estrutura do projeto

```
TechStore/
├── TechStore.Api/                 # Backend (.NET)
│   ├── Controllers/
│   │   ├── AuthController.cs
│   │   ├── ProdutosController.cs
│   │   ├── DetalhesProdutoController.cs
│   │   ├── CategoriasController.cs
│   │   ├── FornecedoresController.cs
│   │   ├── NotasFiscaisController.cs
│   │   └── ItensNotaFiscalController.cs
│   ├── Data/
│   │   └── AppDbContext.cs
│   ├── Models/
│   │   ├── Produto.cs
│   │   ├── Categoria.cs
│   │   ├── Fornecedor.cs
│   │   ├── NotaFiscal.cs
│   │   ├── ItemNotaFiscal.cs
│   │   ├── DetalheProduto.cs
│   │   └── Usuario.cs
│   └── Program.cs
│
└── techstore-frontend/            # Frontend (React)
    └── src/
        ├── components/
        │   ├── auth/               # LoginPage, RegisterPage, ProtectedRoute
        │   ├── produtos/           # Página, tabela, modais de produto
        │   ├── categorias/         # Página, tabela, modal de categoria
        │   ├── fornecedores/       # Página, tabela e modal de fornecedor
        │   ├── notasFiscais/       # Página, tabela, modal de nota fiscal e de itens
        │   ├── ui/                 # Modais, Toasts e Confirmações
        │   └── layout/             # Layout, Sidebar (com alternância de tema)
        ├── contexts/
        │   ├── AuthContext.jsx
        │   ├── ThemeContext.jsx
        │   └── ToastContext.jsx
        ├── services/               # Chamadas à API (Axios)
        │   ├── api.js              # Instância Axios com interceptor de token
        │   ├── authService.js
        │   ├── produtoService.js
        │   ├── categoriaService.js
        │   ├── fornecedorService.js
        │   ├── notaFiscalService.js
        │   └── itemNotaFiscalService.js
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

Não é necessário inserir usuários manualmente no banco. Basta acessar a tela de cadastro da aplicação (ou o endpoint `POST /api/auth/registrar` via Swagger) informando nome de usuário e senha:

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

## Fluxo de Notas Fiscais

Ao cadastrar uma nota fiscal, apenas número, série, fornecedor e data de emissão são informados. Depois de criada, os produtos são adicionados a ela individualmente através do modal de itens, onde:

- Selecionar um produto preenche automaticamente a quantidade em estoque e o preço cadastrado como sugestão inicial (podendo ser ajustados)
- Cada item guarda a quantidade e o valor unitário daquela compra específica, independente do valor atual do produto
- O valor total da nota é somado automaticamente a partir dos itens, sem necessidade de digitação manual

## Modo claro/escuro

O tema é controlado pelo `ThemeContext`, que adiciona ou remove a classe `dark` no elemento raiz do documento e persiste a preferência no `localStorage`. O botão de alternância está disponível na Sidebar (para usuários autenticados) e também nas telas de login e cadastro.

## Licença

Projeto de uso educacional/pessoal.