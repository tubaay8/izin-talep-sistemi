const pool = require('../config/db');

async function findAll() {
  const [rows] = await pool.query('SELECT id, name, description FROM leave_types ORDER BY name');
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT id, name, description FROM leave_types WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function create({ name, description }) {
  const [result] = await pool.query('INSERT INTO leave_types (name, description) VALUES (?, ?)', [name, description || null]);
  return result.insertId;
}

async function update(id, { name, description }) {
  await pool.query('UPDATE leave_types SET name = ?, description = ? WHERE id = ?', [name, description || null, id]);
}

async function remove(id) {
  await pool.query('DELETE FROM leave_types WHERE id = ?', [id]);
}

module.exports = { findAll, findById, create, update, remove };
