const mysql = require('mysql2/promise');
require('dotenv').config();

const TEST_DB_NAME = require('./testDbName');

module.exports = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  await connection.query(`DROP DATABASE IF EXISTS \`${TEST_DB_NAME}\`;`);
  await connection.end();
};
