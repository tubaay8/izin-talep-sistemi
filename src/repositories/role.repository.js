const pool = require('../config/db');

async function findByName(name) {
  const [rows] = await pool.query('SELECT * FROM roles WHERE name = ? LIMIT 1', [name]);
  return rows[0] || null;
}

async function findAll() {
  const [rows] = await pool.query('SELECT id, name FROM roles ORDER BY id');
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT id, name FROM roles WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

module.exports = { findByName, findAll, findById };
