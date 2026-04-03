import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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