import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL ||
  (process.env.POSTGRES_USER && process.env.POSTGRES_PASSWORD && process.env.POSTGRES_HOST && process.env.POSTGRES_PORT && process.env.POSTGRES_DB
    ? `postgresql://${process.env.POSTGRES_USER}:${String(process.env.POSTGRES_PASSWORD)}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`
    : undefined);

const pool = new Pool({
  connectionString,
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("✅ Conexão com o banco de dados bem-sucedida!");
    client.release();
  } catch (error) {
    console.error("❌ Erro ao conectar ao banco de dados:", error.message);
  } finally {
    await pool.end();
  }
}

testConnection();