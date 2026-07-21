const pool = require('../../src/config/db');
const { hashPassword } = require('../../src/utils/password');

async function getRoleId(name) {
  const [rows] = await pool.query('SELECT id FROM roles WHERE name = ?', [name]);
  if (!rows[0]) throw new Error(`Rol bulunamadi: ${name}`);
  return rows[0].id;
}

async function getDepartmentId(name) {
  const [rows] = await pool.query('SELECT id FROM departments WHERE name = ?', [name]);
  if (!rows[0]) throw new Error(`Departman bulunamadi: ${name}`);
  return rows[0].id;
}

async function getLeaveTypeId(name) {
  const [rows] = await pool.query('SELECT id FROM leave_types WHERE name = ?', [name]);
  if (!rows[0]) throw new Error(`Izin turu bulunamadi: ${name}`);
  return rows[0].id;
}

async function createUser({ full_name, email, password, role_id, department_id, manager_id = null, is_active = 1 }) {
  const passwordHash = await hashPassword(password);
  const [result] = await pool.query(
    `INSERT INTO users (full_name, email, password, role_id, department_id, manager_id, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [full_name, email, passwordHash, role_id, department_id, manager_id, is_active]
  );
  return result.insertId;
}

// Test icinde olusturulan tum kullanicilari (ve bunlara bagli izin talebi/
// bakiye/aktivite/token kayitlarini) tek seferde temizlemek icin kullanilir.
async function deleteUsers(userIds) {
  const ids = userIds.filter(Boolean);
  if (!ids.length) return;
  const placeholders = ids.map(() => '?').join(',');
  await pool.query(
    `DELETE FROM leave_requests WHERE user_id IN (${placeholders}) OR delegate_user_id IN (${placeholders})`,
    [...ids, ...ids]
  );
  await pool.query(`DELETE FROM leave_balances WHERE user_id IN (${placeholders})`, ids);
  await pool.query(
    `DELETE FROM activity_logs WHERE actor_id IN (${placeholders}) OR target_user_id IN (${placeholders})`,
    [...ids, ...ids]
  );
  await pool.query(`DELETE FROM password_reset_tokens WHERE user_id IN (${placeholders})`, ids);
  await pool.query(`DELETE FROM users WHERE id IN (${placeholders})`, ids);
}

module.exports = { getRoleId, getDepartmentId, getLeaveTypeId, createUser, deleteUsers };
