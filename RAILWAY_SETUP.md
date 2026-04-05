# Configuração do Railway para o Backend

Siga os passos abaixo para configurar o Railway corretamente para o backend do projeto **Meu Clube do Livro**:

## 1. Configurar o Comando de Inicialização

No painel do Railway, vá até as configurações do serviço e configure o comando de inicialização como:

```bash
npm run build && npm start
```

Isso garante que o código TypeScript seja compilado antes de iniciar o servidor.

## 2. Configurar Variáveis de Ambiente

Certifique-se de adicionar as seguintes variáveis de ambiente no Railway:

- **`DATABASE_URL`**: URL do banco de dados PostgreSQL. Exemplo:
  ```
  postgres://usuario:senha@host:porta/nome_do_banco
  ```
- **`PORT`**: Porta para o servidor. O Railway geralmente fornece essa variável automaticamente.

## 3. Testar Localmente

Antes de fazer o deploy, teste os comandos localmente:

```bash
npm install
npm run build
npm start
```

Certifique-se de que o servidor inicia corretamente e que o arquivo `dist/server.js` é gerado.

## 4. Verificar Logs no Railway

Após o deploy, verifique os logs no painel do Railway para garantir que o servidor está funcionando corretamente.

Se houver erros, revise os passos acima e ajuste conforme necessário.
