const pool = require('../config/db');

async function findAll() {
  const [rows] = await pool.query(
    'SELECT id, name, description, counts_toward_quota, is_hourly FROM leave_types WHERE is_active = 1 ORDER BY name'
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(
    'SELECT id, name, description, counts_toward_quota, is_hourly, is_active FROM leave_types WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

async function create({ name, description }) {
  const [result] = await pool.query('INSERT INTO leave_types (name, description) VALUES (?, ?)', [name, description || null]);
  return result.insertId;
}

async function update(id, { name, description }) {
  await pool.query('UPDATE leave_types SET name = ?, description = ? WHERE id = ?', [name, description || null, id]);
}

// Izin turu veritabanindan silinmez, sadece pasife alinir: bu turu kullanan
// gecmis izin talepleri bozulmadan dogru gorunmeye devam eder.
async function deactivate(id) {
  await pool.query('UPDATE leave_types SET is_active = 0 WHERE id = ?', [id]);
}

module.exports = { findAll, findById, create, update, deactivate };
