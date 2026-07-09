const pool = require('../config/db');

async function create({ actor_id, actor_name, actor_role, target_user_id, action_type, description }) {
  const [result] = await pool.query(
    `INSERT INTO activity_logs (actor_id, actor_name, actor_role, target_user_id, action_type, description)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [actor_id, actor_name, actor_role, target_user_id || null, action_type, description]
  );
  return result.insertId;
}

async function findRecentForUser(userId, limit) {
  const [rows] = await pool.query(
    `SELECT * FROM activity_logs
     WHERE actor_id = ? OR target_user_id = ?
     ORDER BY created_at DESC
     LIMIT ?`,
    [userId, userId, Number(limit)]
  );
  return rows;
}

async function findRecentForManager(managerId, limit) {
  const [rows] = await pool.query(
    `SELECT al.*
     FROM activity_logs al
     WHERE al.actor_id = ?
        OR al.actor_id IN (SELECT id FROM users WHERE manager_id = ?)
        OR al.target_user_id IN (SELECT id FROM users WHERE manager_id = ?)
     ORDER BY al.created_at DESC
     LIMIT ?`,
    [managerId, managerId, managerId, Number(limit)]
  );
  return rows;
}

async function findRecentGlobal(limit) {
  const [rows] = await pool.query(`SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT ?`, [Number(limit)]);
  return rows;
}

module.exports = { create, findRecentForUser, findRecentForManager, findRecentGlobal };
