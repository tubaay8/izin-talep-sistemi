const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const TEST_DB_NAME = require('./testDbName');

function runSqlFiles(connection, dir) {
  const files = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.sql'))
    .sort();
  return files.reduce(
    (chain, file) => chain.then(() => connection.query(fs.readFileSync(path.join(dir, file), 'utf8'))),
    Promise.resolve()
  );
}

// Testler her calistiginda temiz bir veritabaniyla baslasin diye once
// eskisi silinip ayni migration/seed dosyalariyla sifirdan kuruluyor.
// Bu, gelistirme veritabanina (DB_NAME) hicbir zaman dokunmaz.
module.exports = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true,
  });

  await connection.query(`DROP DATABASE IF EXISTS \`${TEST_DB_NAME}\`;`);
  await connection.query(
    `CREATE DATABASE \`${TEST_DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_turkish_ci;`
  );
  await connection.changeUser({ database: TEST_DB_NAME });

  await runSqlFiles(connection, path.join(__dirname, '..', '..', 'database', 'migrations'));
  await runSqlFiles(connection, path.join(__dirname, '..', '..', 'database', 'seeds'));

  await connection.end();
};
