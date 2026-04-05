-- 1. Tabela de Usuários
CREATE TABLE IF NOT EXISTS
    users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- 2. Tabela de Livros
CREATE TABLE IF NOT EXISTS
    livros (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        autor VARCHAR(255) NOT NULL,
        isbn VARCHAR(20) UNIQUE,
        genero VARCHAR(50),
        descricao TEXT,
        capa_url TEXT
    );

-- 3. Tabela de Status de Leitura (Para saber o que você já leu)
CREATE TABLE IF NOT EXISTS
    lista_leitura (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        livro_id INTEGER NOT NULL REFERENCES livros (id) ON DELETE CASCADE,
        status VARCHAR(20) NOT NULL CHECK (status IN ('quer ler', 'lendo', 'lido')),
        data_adicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- 4. Tabela de Avaliações/Resenhas
CREATE TABLE IF NOT EXISTS
    avaliacoes (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        livro_id INTEGER NOT NULL REFERENCES livros (id) ON DELETE CASCADE,
        nota INTEGER NOT NULL CHECK (
            nota >= 1
            AND nota <= 5
        ),
        comentario TEXT,
        data_postagem TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );