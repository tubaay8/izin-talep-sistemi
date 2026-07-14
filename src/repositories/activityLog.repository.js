const pool = require('../config/db');

async function create({ actor_id, actor_name, actor_role, target_user_id, action_type, description }) {
  const [result] = await pool.query(
    `INSERT INTO activity_logs (actor_id, actor_name, actor_role, target_user_id, action_type, description)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [actor_id, actor_name, actor_role, target_user_id || null, action_type, description]
  );
  return result.insertId;
}

function offsetOf(pagination) {
  return (pagination.page - 1) * pagination.limit;
}

async function findRecentForUser(userId, pagination) {
  const [rows] = await pool.query(
    `SELECT * FROM activity_logs
     WHERE (actor_id = ? OR target_user_id = ?) AND action_type != 'user.profile_updated'
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [userId, userId, Number(pagination.limit), offsetOf(pagination)]
  );
  return rows;
}

async function countForUser(userId) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total FROM activity_logs
     WHERE (actor_id = ? OR target_user_id = ?) AND action_type != 'user.profile_updated'`,
    [userId, userId]
  );
  return rows[0].total;
}

async function findRecentForManager(managerId, pagination) {
  const [rows] = await pool.query(
    `SELECT al.*
     FROM activity_logs al
     WHERE (
        al.actor_id = ?
        OR al.actor_id IN (SELECT id FROM users WHERE manager_id = ?)
        OR al.target_user_id IN (SELECT id FROM users WHERE manager_id = ?)
     ) AND al.action_type != 'user.profile_updated'
     ORDER BY al.created_at DESC
     LIMIT ? OFFSET ?`,
    [managerId, managerId, managerId, Number(pagination.limit), offsetOf(pagination)]
  );
  return rows;
}

async function countForManager(managerId) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM activity_logs al
     WHERE (
        al.actor_id = ?
        OR al.actor_id IN (SELECT id FROM users WHERE manager_id = ?)
        OR al.target_user_id IN (SELECT id FROM users WHERE manager_id = ?)
     ) AND al.action_type != 'user.profile_updated'`,
    [managerId, managerId, managerId]
  );
  return rows[0].total;
}

async function findRecentGlobal(pagination) {
  const [rows] = await pool.query(
    `SELECT * FROM activity_logs
     WHERE action_type != 'user.profile_updated'
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [Number(pagination.limit), offsetOf(pagination)]
  );
  return rows;
}

async function countGlobal() {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total FROM activity_logs WHERE action_type != 'user.profile_updated'`
  );
  return rows[0].total;
}

module.exports = {
  create,
  findRecentForUser,
  countForUser,
  findRecentForManager,
  countForManager,
  findRecentGlobal,
  countGlobal,
};
