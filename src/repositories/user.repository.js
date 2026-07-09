const pool = require('../config/db');

async function findByEmail(email) {
  const [rows] = await pool.query(
    `SELECT u.*, r.name AS role_name
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.email = ?
     LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT u.id, u.full_name, u.email, u.role_id, r.name AS role_name,
            u.department_id, u.manager_id, u.is_active
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function create({ full_name, email, passwordHash, role_id, department_id, manager_id = null }) {
  const [result] = await pool.query(
    `INSERT INTO users (full_name, email, password, role_id, department_id, manager_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [full_name, email, passwordHash, role_id, department_id, manager_id]
  );
  return result.insertId;
}

async function findManagers() {
  const [rows] = await pool.query(
    `SELECT u.id, u.full_name
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE r.name = 'Yonetici' AND u.is_active = 1
     ORDER BY u.full_name`
  );
  return rows;
}

const ADMIN_SELECT_FIELDS = `
  u.id, u.full_name, u.email, u.role_id, r.name AS role_name,
  u.department_id, d.name AS department_name,
  u.manager_id, m.full_name AS manager_name,
  u.is_active, u.created_at, u.updated_at
`;

function buildUserFilters(filters = {}) {
  const clauses = [];
  const params = [];

  if (filters.search) {
    clauses.push('(u.full_name LIKE ? OR u.email LIKE ?)');
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }
  if (filters.role_id) {
    clauses.push('u.role_id = ?');
    params.push(filters.role_id);
  }
  if (filters.department_id) {
    clauses.push('u.department_id = ?');
    params.push(filters.department_id);
  }
  if (filters.is_active !== undefined && filters.is_active !== '') {
    clauses.push('u.is_active = ?');
    params.push(filters.is_active === 'true' || filters.is_active === true ? 1 : 0);
  }

  return { clauses, params };
}

async function findAll(filters = {}) {
  const { clauses, params } = buildUserFilters(filters);
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT ${ADMIN_SELECT_FIELDS}
     FROM users u
     JOIN roles r ON r.id = u.role_id
     JOIN departments d ON d.id = u.department_id
     LEFT JOIN users m ON m.id = u.manager_id
     ${where}
     ORDER BY u.is_active DESC, u.full_name ASC`,
    params
  );
  return rows;
}

async function findByIdDetailed(id) {
  const [rows] = await pool.query(
    `SELECT ${ADMIN_SELECT_FIELDS}
     FROM users u
     JOIN roles r ON r.id = u.role_id
     JOIN departments d ON d.id = u.department_id
     LEFT JOIN users m ON m.id = u.manager_id
     WHERE u.id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function update(id, { full_name, email, role_id, department_id, manager_id, is_active }) {
  await pool.query(
    `UPDATE users
     SET full_name = ?, email = ?, role_id = ?, department_id = ?, manager_id = ?, is_active = ?
     WHERE id = ?`,
    [full_name, email, role_id, department_id, manager_id, is_active, id]
  );
}

async function updatePassword(id, passwordHash) {
  await pool.query('UPDATE users SET password = ? WHERE id = ?', [passwordHash, id]);
}

async function countByManagerId(managerId) {
  const [rows] = await pool.query('SELECT COUNT(*) AS total FROM users WHERE manager_id = ?', [managerId]);
  return rows[0].total;
}

async function countByActiveStatus() {
  const [rows] = await pool.query('SELECT is_active, COUNT(*) AS count FROM users GROUP BY is_active');
  return rows;
}

async function countTotal() {
  const [rows] = await pool.query('SELECT COUNT(*) AS total FROM users');
  return rows[0].total;
}

async function findRecent(limit) {
  const [rows] = await pool.query(
    `SELECT ${ADMIN_SELECT_FIELDS}
     FROM users u
     JOIN roles r ON r.id = u.role_id
     JOIN departments d ON d.id = u.department_id
     LEFT JOIN users m ON m.id = u.manager_id
     ORDER BY u.created_at DESC
     LIMIT ?`,
    [limit]
  );
  return rows;
}

module.exports = {
  findByEmail,
  findById,
  create,
  findManagers,
  findAll,
  findByIdDetailed,
  update,
  updatePassword,
  countByManagerId,
  countByActiveStatus,
  countTotal,
  findRecent,
};
