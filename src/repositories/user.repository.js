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

async function create({
  full_name,
  email,
  passwordHash,
  role_id,
  department_id,
  manager_id = null,
  must_change_password = false,
}) {
  const [result] = await pool.query(
    `INSERT INTO users (full_name, email, password, role_id, department_id, manager_id, must_change_password)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [full_name, email, passwordHash, role_id, department_id, manager_id, must_change_password ? 1 : 0]
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

async function findAvailableManagers(excludeDepartmentId = null) {
  const [rows] = await pool.query(
    `SELECT u.id, u.full_name
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE r.name = 'Yonetici' AND u.is_active = 1
       AND (
         u.id NOT IN (SELECT manager_id FROM departments WHERE manager_id IS NOT NULL)
         OR u.id = (SELECT manager_id FROM departments WHERE id = ?)
       )
     ORDER BY u.full_name`,
    [excludeDepartmentId]
  );
  return rows;
}

async function findActiveByDepartmentId(departmentId, excludeUserId) {
  const [rows] = await pool.query(
    `SELECT u.id, u.full_name, u.department_id, d.name AS department_name, r.name AS role_name
     FROM users u
     JOIN roles r ON r.id = u.role_id
     JOIN departments d ON d.id = u.department_id
     WHERE u.department_id = ? AND u.id != ? AND u.is_active = 1
     ORDER BY u.full_name`,
    [departmentId, excludeUserId]
  );
  return rows;
}

const ADMIN_SELECT_FIELDS = `
  u.id, u.full_name, u.email, u.profile_photo, u.role_id, r.name AS role_name,
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

async function findAll(filters = {}, pagination = null) {
  const { clauses, params } = buildUserFilters(filters);
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  let limitClause = '';
  if (pagination && pagination.limit) {
    limitClause = ' LIMIT ? OFFSET ?';
    params.push(pagination.limit, (pagination.page - 1) * pagination.limit);
  }

  const [rows] = await pool.query(
    `SELECT ${ADMIN_SELECT_FIELDS}
     FROM users u
     JOIN roles r ON r.id = u.role_id
     JOIN departments d ON d.id = u.department_id
     LEFT JOIN users m ON m.id = u.manager_id
     ${where}
     ORDER BY u.is_active DESC, u.full_name ASC${limitClause}`,
    params
  );
  return rows;
}

async function countFiltered(filters = {}) {
  const { clauses, params } = buildUserFilters(filters);
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM users u
     JOIN roles r ON r.id = u.role_id
     JOIN departments d ON d.id = u.department_id
     LEFT JOIN users m ON m.id = u.manager_id
     ${where}`,
    params
  );
  return rows[0].total;
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

async function updatePasswordAndClearMustChange(id, passwordHash) {
  await pool.query('UPDATE users SET password = ?, must_change_password = 0 WHERE id = ?', [passwordHash, id]);
}

async function updateOwnProfile(id, { full_name, email, profile_photo }) {
  if (profile_photo !== undefined) {
    await pool.query('UPDATE users SET full_name = ?, email = ?, profile_photo = ? WHERE id = ?', [
      full_name,
      email,
      profile_photo,
      id,
    ]);
  } else {
    await pool.query('UPDATE users SET full_name = ?, email = ? WHERE id = ?', [full_name, email, id]);
  }
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
  findAvailableManagers,
  findAll,
  countFiltered,
  findByIdDetailed,
  update,
  updatePassword,
  updatePasswordAndClearMustChange,
  updateOwnProfile,
  countByManagerId,
  countByActiveStatus,
  countTotal,
  findRecent,
  findActiveByDepartmentId,
};
