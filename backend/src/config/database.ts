import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// Para Railway: tenta DATABASE_URL, se não tiver, monta a partir das variáveis individuais
const databaseUrl =
  process.env.DATABASE_URL ||
  (process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_HOST && process.env.DB_PORT && process.env.DB_NAME
    ? `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    : undefined);

if (!databaseUrl) {
  throw new Error(
    "❌ DATABASE_URL environment variable is not set! Also tried to build from individual DB_* variables."
  );
}

const pool = new Pool({
  connectionString: databaseUrl,
});

pool.on("error", (err: Error) => {
  console.error("[DB] Unexpected error on idle client", err);
});

export async function initializeDatabase() {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    console.log("[DB] ✅ Connected to PostgreSQL at", result.rows[0].now);
    client.release();
  } catch (error) {
    console.error("[DB] ❌ Failed to connect to PostgreSQL:", error);
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

export default pool;
