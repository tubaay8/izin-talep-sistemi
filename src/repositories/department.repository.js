const pool = require('../config/db');

const SELECT_FIELDS = `
  d.id, d.name, d.manager_id, m.full_name AS manager_name
`;

async function findAll() {
  const [rows] = await pool.query(
    `SELECT ${SELECT_FIELDS}
     FROM departments d
     LEFT JOIN users m ON m.id = d.manager_id
     ORDER BY d.name`
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT ${SELECT_FIELDS}
     FROM departments d
     LEFT JOIN users m ON m.id = d.manager_id
     WHERE d.id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function findByName(name) {
  const [rows] = await pool.query('SELECT id, name, manager_id FROM departments WHERE name = ? LIMIT 1', [name]);
  return rows[0] || null;
}

async function countTotal() {
  const [rows] = await pool.query('SELECT COUNT(*) AS total FROM departments');
  return rows[0].total;
}

async function create(name, managerId = null) {
  const [result] = await pool.query('INSERT INTO departments (name, manager_id) VALUES (?, ?)', [name, managerId]);
  return result.insertId;
}

async function update(id, name, managerId = null) {
  await pool.query('UPDATE departments SET name = ?, manager_id = ? WHERE id = ?', [name, managerId, id]);
}

async function remove(id) {
  await pool.query('DELETE FROM departments WHERE id = ?', [id]);
}

module.exports = { findAll, findById, findByName, countTotal, create, update, remove };
