import dotenv from "dotenv";
import pg from 'pg';
const { Pool } = pg;
dotenv.config();
const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres',
});
async function testConnection() {
    try {
        const client = await pool.connect();
        console.log("✅ Conexão com o banco de dados bem-sucedida!");
        client.release();
    }
    catch (error) {
        console.error("❌ Erro ao conectar ao banco de dados:", error.message);
    }
    finally {
        await pool.end();
    }
}
testConnection();
//# sourceMappingURL=test-db-connection.js.map