import pg from 'pg';

const { Client } = pg;

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'gjwOvTnCRaJvxZbueyeCMXmkKEuvBRgr',
  database: 'railway',
});

async function testConnection() {
  try {
    console.log('Tentando conectar ao banco de dados...');
    await client.connect();
    console.log('Conexão com o banco de dados bem-sucedida!');
    await client.end();
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
  }
}

testConnection();