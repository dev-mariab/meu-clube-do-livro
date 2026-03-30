# Meu Clube do Livro - Backend Setup 📚

Este é o backend Node.js/Express para a aplicação **Meu Clube do Livro**.

## Pré-requisitos

- **Node.js 18+** (ou superior)
- **PostgreSQL 14+** instalado e rodando localmente
- **npm** ou **yarn**

## Instalação

### 1. Clonar/Preparar o Projeto

O backend está em `/backend`. Navegue até lá:

```bash
cd backend
```

### 2. Instalar Dependências

```bash
npm install
# ou
yarn install
```

### 3. Configurar PostgreSQL

#### Se você AINDA NÃO tiver um banco `meu_clube_do_livro`:

```bash
# Acesse PostgreSQL como superuser
psql -U postgres

# Dentro do PostgreSQL, execute:
CREATE DATABASE meu_clube_do_livro;
\q

# Ou via terminal diretamente:
createdb -U postgres meu_clube_do_livro
```

#### Se você JÁ tem um banco de dados:

Atualize apenas as tabelas necessárias. O servidor criará/verificará as tabelas automaticamente na primeira execução.

### 4. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite `.env` com suas credenciais Postgres. Exemplo:

```env
DATABASE_URL=postgresql://postgres:sua_senha@localhost:5432/meu_clube_do_livro
DB_HOST=localhost
DB_PORT=5432
DB_NAME=meu_clube_do_livro
DB_USER=postgres
DB_PASSWORD=sua_senha

PORT=3000
NODE_ENV=development

JWT_SECRET=sua_chave_secreta_muito_segura_aqui_mude_em_producao
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:5173
```

> **⚠️ IMPORTANTE**: Mude o `JWT_SECRET` para uma chave aleatória e segura em produção!

### 5. Iniciar o Servidor

#### Modo Desenvolviment (com auto-reload):

```bash
npm run dev
# ou
yarn dev
```

Você deve ver algo como:

```
[Server] Initializing database...
[DB] ✅ Connected to PostgreSQL at 2024-03-30T10:30:45.123Z
[Server] Running migrations...
[DB] ✅ Users table ready
[DB] ✅ Books table ready
[DB] ✅ Reading goals table ready
[DB] ✅ All migrations completed
[Server] ✅ Server running at http://localhost:3000
[Server] API prefix: /make-server-93f7c220
[Server] CORS enabled for: http://localhost:5173
```

#### Modo Produção:

```bash
npm run build
npm start
```

## Endpoints da API

Todos os endpoints (exceto signup/login) requerem token JWT no header:

```bash
Authorization: Bearer <token>
```

### Autenticação

- **POST** `/make-server-93f7c220/signup` - Criar conta
- **POST** `/make-server-93f7c220/login` - Fazer login
- **GET** `/make-server-93f7c220/auth/me` - Dados do usuário logado

### Livros

- **GET** `/make-server-93f7c220/books` - Listar todos os livros
- **GET** `/make-server-93f7c220/books/:id` - Obter detalhes de um livro
- **POST** `/make-server-93f7c220/books` - Criar novo livro
- **PUT** `/make-server-93f7c220/books/:id` - Atualizar livro
- **DELETE** `/make-server-93f7c220/books/:id` - Deletar livro
- **GET** `/make-server-93f7c220/stats` - Estatísticas de leitura

### Metas

- **GET** `/make-server-93f7c220/goals` - Obter metas de leitura
- **POST** `/make-server-93f7c220/goals` - Salvar/atualizar metas

## Estrutura do Projeto

```
backend/
├── src/
│   ├── server.ts              # Arquivo principal do Express
│   ├── config/
│   │   └── database.ts        # Conexão e migrations do Postgres
│   ├── middleware/
│   │   └── auth.ts            # Middleware de autenticação JWT
│   ├── models/
│   │   ├── User.ts            # Model de usuário
│   │   ├── Book.ts            # Model de livro
│   │   └── ReadingGoal.ts     # Model de metas
│   ├── controllers/
│   │   ├── AuthController.ts  # Lógica de autenticação
│   │   ├── BooksController.ts # Lógica de livros
│   │   └── GoalsController.ts # Lógica de metas
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── books.ts
│   │   └── goals.ts
│   └── utils/
│       └── jwt.ts             # Funções de JWT
├── .env.example
├── package.json
└── tsconfig.json
```

## Troubleshooting

### Erro: "connectrefused" ou "ECONNREFUSED"

Seu Postgres não está rodando. Inicie-o:

```bash
# Linux/Mac (se instalado via Homebrew)
brew services start postgresql

# Ou manualmente
postgres -D /usr/local/var/postgres

# Windows (PostgreSQL Service)
# Verifique em Services se PostgreSQL está rodando
```

### Erro: "password authentication failed"

Verifique a senha no `.env`:

```bash
# Teste diretamente:
psql -U postgres -d postgres -h localhost

# Se funcionar, use mesma senha no .env
```

### Erro: "database does not exist"

Crie o banco:

```bash
createdb -U postgres meu_clube_do_livro
```

### Porta 3000 já em uso

Mude a porta no `.env`:

```env
PORT=3001
```

## Próximos Passos

1. **Configure o Frontend** para apontar para `http://localhost:3000`
   - Atualize `.env` do frontend: `VITE_API_URL=http://localhost:3000`

2. **Inicie o Frontend** (em outro terminal):

   ```bash
   cd ../
   npm run dev
   ```

3. **Teste o fluxo de autenticação**:
   - Acesse http://localhost:5173
   - Crie uma conta
   - Faça login
   - Tente criar um livro

## Deploy em Produção

Para deployar em produção:

1. Build a aplicação:

   ```bash
   npm run build
   ```

2. Use um serviço como **Heroku**, **Render**, **Railway**, etc.

3. Configure variáveis de ambiente no serviço:
   - `DATABASE_URL` (sua URL Postgres produção)
   - `JWT_SECRET` (chave aleatória e segura)
   - Outros valores do `.env`

Exemplo com **Railway**:

```bash
npm install -g railway
railway link
railway add
railway up
```

## Documentação Adicional

- [Express.js Docs](https://expressjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [JWT Introduction](https://jwt.io/introduction)

---

Dúvidas? Abra uma issue ou entre em contato! 📖✨
