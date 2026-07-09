const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const SEEDS_DIR = path.join(__dirname, 'seeds');

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  const files = fs
    .readdirSync(SEEDS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(SEEDS_DIR, file), 'utf8');
    console.log(`Calistiriliyor: ${file}`);
    await connection.query(sql);
  }

  console.log('Tum seed dosyalari basariyla calistirildi.');
  await connection.end();
}

run().catch((err) => {
  console.error('Seed hatasi:', err.message);
  process.exit(1);
});
