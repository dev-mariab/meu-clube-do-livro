# 🚀 Guia Rápido de Setup - Meu Clube do Livro

Parabéns! Você migrou com sucesso de Supabase para seu próprio Postgres + Node.js! Aqui estão os passos para colocar tudo funcionando.

## ⚡ 5 Passos Rápidos

### 1. PostgreSQL está rodando?

Verifique se tem PostgreSQL instalado:

```bash
psql --version
```

Se não tiver:

- **macOS**: `brew install postgresql`
- **Linux (Ubuntu)**: `sudo apt-get install postgresql`
- **Windows**: [Download aqui](https://www.postgresql.org/download/windows/)

Inicie o PostgreSQL:

```bash
# macOS (Homebrew)
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
# Procure "PostgreSQL" em Services e verifique se está rodando
```

### 2. Criar banco de dados

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Dentro do prompt:
CREATE DATABASE meu_clube_do_livro;
\q
```

Ou direto:

```bash
createdb -U postgres meu_clube_do_livro
```

### 3. Configurar Backend

```bash
cd backend

# Copiar arquivo de ambiente
cp .env.example .env

# Editar .env com sua senha Postgres
# (procure pela linha DB_PASSWORD=)
nano .env  # ou use seu editor favorito

# Instalar dependências
npm install

# Iniciar servidor
npm run dev
```

Você deve ver: `✅ Server running at http://localhost:3000`

### 4. Configurar Frontend

```bash
# Na raiz do projeto (saia de /backend)
cd ..

# Copiar arquivo de ambiente
cp .env.example .env

# Verificar/editar .env
# Certifique-se que tem:
# VITE_API_URL=http://localhost:3000

# Instalar dependências (se ainda não fez)
npm install

# Iniciar frontend (outro terminal!)
npm run dev
```

Você deve ver: `Local: http://localhost:5173`

### 5. Testar!

1. Abra http://localhost:5173
2. Clique em "Criar Conta"
3. Crie uma conta com email e senha
4. Você deve ser redirecionado para a home
5. Teste criar um livro

✨ **Pronto!** Está funcionando?

---

## 📋 Checklist de Verificação

- [ ] PostgreSQL está rodando (`psql -U postgres`)
- [ ] Banco `meu_clube_do_livro` existe
- [ ] Backend `.env` configurado com senha Postgres correta
- [ ] Backend rodando em http://localhost:3000 (vê mensagem de sucesso)
- [ ] Frontend `.env` tem `VITE_API_URL=http://localhost:3000`
- [ ] Frontend rodando em http://localhost:5173
- [ ] Consegue fazer signup com email e senha
- [ ] Consegue fazer login
- [ ] Consegue criar/editar/deletar um livro

---

## 🆘 Problemas Comuns

### "Connection refused" no backend

Seu Postgres não está rodando. Inicie:

```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Verifique se está rodando
psql -U postgres -d postgres -c "SELECT 1"
```

### "Password authentication failed"

A senha no `.env` está errada. Teste:

```bash
psql -U postgres -h localhost
```

Se funcionar, copie a senha que usou para o `.env`.

### "Database does not exist"

```bash
createdb -U postgres meu_clube_do_livro
```

### Frontend não consegue conectar ao backend

- Verifique se backend está rodando: http://localhost:3000/health
- Verifique se frontend tem `VITE_API_URL=http://localhost:3000` em `.env`
- Reinicie o frontend (Ctrl+C, depois `npm run dev`)

---

## 📂 Estrutura Final

Seu projeto agora tem:

```
meu-clube-do-livro/
├── backend/              # ← Novo! Node.js/Express
│   ├── src/
│   ├── .env             # Configuração local
│   ├── package.json
│   └── README.md
├── src/                  # React (atualizado)
│   └── app/
│       ├── lib/
│       │   ├── postgresdb.ts  # ← Novo! Cliente do backend
│       │   └── api.ts          # ← Atualizado
│       ├── contexts/auth-context.tsx  # ← Atualizado
│       └── pages/auth-page.tsx         # ← Atualizado
├── .env                  # Configuração frontend
└── package.json
```

---

## 🔗 URLs Importantes

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **API Base**: http://localhost:3000/make-server-93f7c220
- **PostgreSQL**: localhost:5432

---

## 📖 Próximos Passos (Opcional)

Agora que está rodando localmente, você pode:

1. **Deploy em Produção**
   - Hospedar backend em Railway, Render, Heroku etc.
   - Hospedar frontend em Vercel, Netlify etc.
   - Usar Postgres gerenciado (Railway, Render, AWS RDS)

2. **Melhorias**
   - Adicionar refresh tokens
   - Implementar rate limiting
   - Adicionar validações mais rigorosas
   - Adicionar testes automatizados

3. **Remover Supabase**
   - Apagar `supabase/info.tsx`
   - Remover `@supabase/supabase-js` de dependências
   - Remover lógica de Supabase storage

---

Dúvidas? Consulte:

- [Backend README](./backend/README.md)
- [Documentação PostgreSQL](https://www.postgresql.org/docs/)
- [Documentação Express.js](https://expressjs.com/)

Bom desenvolvimento! 🚀📚
