-- Deletar o banco de dados existente, se ele existir
DROP DATABASE IF EXISTS meu_clube_do_livro;

-- Criar o banco de dados
CREATE DATABASE meu_clube_do_livro;

-- Conceder todas as permissões ao usuário postgres
GRANT ALL PRIVILEGES ON DATABASE meu_clube_do_livro TO postgres;