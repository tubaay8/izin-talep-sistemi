const pool = require('../config/db');

async function findAll() {
  const [rows] = await pool.query('SELECT id, name FROM departments ORDER BY name');
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT id, name FROM departments WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function countTotal() {
  const [rows] = await pool.query('SELECT COUNT(*) AS total FROM departments');
  return rows[0].total;
}

async function create(name) {
  const [result] = await pool.query('INSERT INTO departments (name) VALUES (?)', [name]);
  return result.insertId;
}

async function update(id, name) {
  await pool.query('UPDATE departments SET name = ? WHERE id = ?', [name, id]);
}

async function remove(id) {
  await pool.query('DELETE FROM departments WHERE id = ?', [id]);
}

module.exports = { findAll, findById, countTotal, create, update, remove };
