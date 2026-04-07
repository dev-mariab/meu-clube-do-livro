import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

// Para Railway: tenta DATABASE_URL, depois Railway POSTGRES_* vars, depois vars individuais
const databaseUrl =
  process.env.DATABASE_URL ||
  (process.env.POSTGRES_USER && process.env.POSTGRES_PASSWORD && process.env.POSTGRES_HOST && process.env.POSTGRES_PORT && process.env.POSTGRES_DB
    ? `postgresql://${String(process.env.POSTGRES_USER)}:${String(process.env.POSTGRES_PASSWORD)}@${String(process.env.POSTGRES_HOST)}:${String(process.env.POSTGRES_PORT)}/${String(process.env.POSTGRES_DB)}`
    : (process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_HOST && process.env.DB_PORT && process.env.DB_NAME
      ? `postgresql://${String(process.env.DB_USER)}:${String(process.env.DB_PASSWORD)}@${String(process.env.DB_HOST)}:${String(process.env.DB_PORT)}/${String(process.env.DB_NAME)}`
      : undefined));

if (!databaseUrl) {
  console.error("[DB] ❌ No database URL found!");
  console.error("[DB] Checked for:");
  console.error("[DB]   - DATABASE_URL env var:", !!process.env.DATABASE_URL, process.env.DATABASE_URL ? "✓" : "✗");
  console.error("[DB]   - POSTGRES_* vars (Railway):", {
    host: !!process.env.POSTGRES_HOST ? process.env.POSTGRES_HOST : "✗",
    port: !!process.env.POSTGRES_PORT ? process.env.POSTGRES_PORT : "✗",
    user: !!process.env.POSTGRES_USER ? process.env.POSTGRES_USER : "✗",
    password: !!process.env.POSTGRES_PASSWORD ? "***" : "✗",
    db: !!process.env.POSTGRES_DB ? process.env.POSTGRES_DB : "✗",
  });
  console.error("[DB]   - DB_* vars (legacy):", {
    host: !!process.env.DB_HOST ? process.env.DB_HOST : "✗",
    port: !!process.env.DB_PORT ? process.env.DB_PORT : "✗",
    user: !!process.env.DB_USER ? process.env.DB_USER : "✗",
    password: !!process.env.DB_PASSWORD ? "***" : "✗",
    name: !!process.env.DB_NAME ? process.env.DB_NAME : "✗",
  });
  console.error("[DB] Available env vars:", Object.keys(process.env).filter(k => k.includes('DB') || k.includes('POSTGRES') || k.includes('DATABASE')));
  throw new Error(
    "❌ DATABASE_URL environment variable is not set! Also tried POSTGRES_* (Railway) and DB_* (legacy) variables."
  );
}

const pool = new Pool({ connectionString: databaseUrl });

export { pool };

pool.on("error", (err: Error) => {
  console.error("[DB] Erro inesperado no cliente inativo", err);
});

export async function initializeDatabase() {
  try {
    const client = await pool.connect();
    console.log("[DB] Conexão com o banco de dados inicializada com sucesso!");
    client.release();
  } catch (error) {
    console.error("[DB] Erro ao inicializar a conexão com o banco de dados:", error);
    throw error;
  }
}

export async function runMigrations() {
  const client = await pool.connect();

  try {
    console.log("[DB] Running migrations...");

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("[DB] ✅ Users table ready");

    // Create books table
    await client.query(`
      CREATE TABLE IF NOT EXISTS books (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255),
        isbn VARCHAR(20),
        category VARCHAR(100),
        status VARCHAR(50) DEFAULT 'reading',
        progress INTEGER DEFAULT 0,
        current_page INTEGER DEFAULT 0,
        total_pages INTEGER DEFAULT 0,
        cover_url TEXT,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("[DB] ✅ Books table ready");

    // Create reading_goals table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reading_goals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        yearly_book_goal INTEGER,
        yearly_page_goal INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("[DB] ✅ Reading goals table ready");

    // Create indexes
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at DESC);`
    );
    console.log("[DB] ✅ Indexes created");

    console.log("[DB] ✅ All migrations completed");
  } catch (error) {
    console.error("[DB] ❌ Migration failed:", error);
    throw error;
  } finally {
    client.release();
  }
}
