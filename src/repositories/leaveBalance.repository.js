const pool = require('../config/db');

async function findByUserAndYear(userId, year) {
  const [rows] = await pool.query('SELECT * FROM leave_balances WHERE user_id = ? AND year = ? LIMIT 1', [
    userId,
    year,
  ]);
  return rows[0] || null;
}

async function create({ user_id, year, entitled_days, used_days }) {
  const [result] = await pool.query(
    `INSERT INTO leave_balances (user_id, year, entitled_days, used_days) VALUES (?, ?, ?, ?)`,
    [user_id, year, entitled_days, used_days]
  );
  return result.insertId;
}

async function incrementUsedDays(id, days) {
  await pool.query('UPDATE leave_balances SET used_days = used_days + ? WHERE id = ?', [days, id]);
}

async function decrementUsedDays(id, days) {
  await pool.query('UPDATE leave_balances SET used_days = GREATEST(0, used_days - ?) WHERE id = ?', [days, id]);
}

module.exports = { findByUserAndYear, create, incrementUsedDays, decrementUsedDays };
