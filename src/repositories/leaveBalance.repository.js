const pool = require('../config/db');

async function findByUserAndYear(userId, year) {
  const [rows] = await pool.query('SELECT * FROM leave_balances WHERE user_id = ? AND year = ? LIMIT 1', [
    userId,
    year,
  ]);
  return rows[0] || null;
}

async function create({ user_id, year, entitled_days, used_days, pending_minutes }) {
  const [result] = await pool.query(
    `INSERT INTO leave_balances (user_id, year, entitled_days, used_days, pending_minutes) VALUES (?, ?, ?, ?, ?)`,
    [user_id, year, entitled_days, used_days, pending_minutes || 0]
  );
  return result.insertId;
}

// Gun ve saatlik izinler ayni havuzu (used_days + pending_minutes) paylastigi
// icin artik tekil increment/decrement yerine, cagiran taraf (leaveBalance.service.js)
// yeni toplami hesaplayip dogrudan yazdirir.
async function setUsage(id, { used_days, pending_minutes }) {
  await pool.query('UPDATE leave_balances SET used_days = ?, pending_minutes = ? WHERE id = ?', [
    used_days,
    pending_minutes,
    id,
  ]);
}

module.exports = { findByUserAndYear, create, setUsage };
