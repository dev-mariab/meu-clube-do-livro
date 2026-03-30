# ⚠️ PostgreSQL Não Está Instalado

Você precisa instalar PostgreSQL localmente no seu computador antes de poder rodar o backend.

## 🔧 Como Instalar

### macOS (com Homebrew)

```bash
# Instalar Homebrew se não tiver
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar PostgreSQL
brew install postgresql

# Iniciar PostgreSQL
brew services start postgresql

# Verificar se está rodando
psql --version
```

### Windows

1. Baixe o instalador de [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. Execute o instalador e siga os passos:
   - Anote a senha do usuário `postgres` que você definir
   - Mantenha porta padrão 5432
3. PostgreSQL será iniciado automaticamente como serviço

### Linux (Ubuntu/Debian)

```bash
# Instalar PostgreSQL
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib

# Iniciar serviço
sudo systemctl start postgresql
sudo systemctl status postgresql
```

---

## ✅ Verificar Instalação

Depois de instalar, teste em um terminal:

```bash
psql --version
psql -U postgres
```

Se conseguir se conectar (sem erros), está funcionando!

---

## 📝 Após Instalar PostgreSQL

1. Crie o banco de dados:

   ```bash
   createdb -U postgres meu_clube_do_livro
   ```

2. Verifique se `.env` do backend tem a senha correta:

   ```bash
   cat backend/.env
   # Deve ter: DB_PASSWORD=2003
   ```

3. Inicie o backend:
   ```bash
   cd backend
   npm run dev
   ```

---

## 🆘 Ainda Tendo Problemas?

Compartilhe qual erro você está recebendo depois de instalar PostgreSQL.

Você está em qual sistema operacional?

- macOS
- Windows
- Linux
