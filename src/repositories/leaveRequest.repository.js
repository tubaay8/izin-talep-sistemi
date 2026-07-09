const pool = require('../config/db');
const { buildLeaveRequestFilters } = require('../utils/leaveRequestFilters');

const SELECT_FIELDS = `
  lr.id, lr.user_id, lr.leave_type_id, lt.name AS leave_type_name,
  lr.start_date, lr.end_date, lr.reason, lr.report_file, lr.status,
  lr.approved_by, lr.approval_note, lr.decided_at,
  lr.created_at, lr.updated_at
`;

async function findAllByUserId(userId, filters = {}) {
  const { clauses, params } = buildLeaveRequestFilters(filters);
  const extraWhere = clauses.length ? ` AND ${clauses.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT ${SELECT_FIELDS}
     FROM leave_requests lr
     JOIN leave_types lt ON lt.id = lr.leave_type_id
     WHERE lr.user_id = ?${extraWhere}
     ORDER BY lr.created_at DESC`,
    [userId, ...params]
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT ${SELECT_FIELDS}
     FROM leave_requests lr
     JOIN leave_types lt ON lt.id = lr.leave_type_id
     WHERE lr.id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function create({ user_id, leave_type_id, start_date, end_date, reason, report_file }) {
  const [result] = await pool.query(
    `INSERT INTO leave_requests (user_id, leave_type_id, start_date, end_date, reason, report_file)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [user_id, leave_type_id, start_date, end_date, reason || null, report_file || null]
  );
  return result.insertId;
}

async function update(id, { leave_type_id, start_date, end_date, reason, report_file }) {
  if (report_file !== undefined) {
    await pool.query(
      `UPDATE leave_requests
       SET leave_type_id = ?, start_date = ?, end_date = ?, reason = ?, report_file = ?
       WHERE id = ?`,
      [leave_type_id, start_date, end_date, reason || null, report_file, id]
    );
  } else {
    await pool.query(
      `UPDATE leave_requests
       SET leave_type_id = ?, start_date = ?, end_date = ?, reason = ?
       WHERE id = ?`,
      [leave_type_id, start_date, end_date, reason || null, id]
    );
  }
}

async function cancel(id) {
  await pool.query(`UPDATE leave_requests SET status = 'cancelled' WHERE id = ?`, [id]);
}

async function findAllByManagerId(managerId, filters = {}) {
  const { clauses, params } = buildLeaveRequestFilters(filters);
  const extraWhere = clauses.length ? ` AND ${clauses.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT ${SELECT_FIELDS}, u.full_name AS employee_name, d.name AS department_name
     FROM leave_requests lr
     JOIN leave_types lt ON lt.id = lr.leave_type_id
     JOIN users u ON u.id = lr.user_id
     JOIN departments d ON d.id = u.department_id
     WHERE u.manager_id = ?${extraWhere}
     ORDER BY lr.created_at DESC`,
    [managerId, ...params]
  );
  return rows;
}

async function decide(id, { status, approved_by, approval_note }) {
  await pool.query(
    `UPDATE leave_requests
     SET status = ?, approved_by = ?, approval_note = ?, decided_at = NOW()
     WHERE id = ?`,
    [status, approved_by, approval_note || null, id]
  );
}

async function countByUserId(userId) {
  const [rows] = await pool.query(
    `SELECT status, COUNT(*) AS count FROM leave_requests WHERE user_id = ? GROUP BY status`,
    [userId]
  );
  return rows;
}

async function countByManagerId(managerId) {
  const [rows] = await pool.query(
    `SELECT lr.status, COUNT(*) AS count
     FROM leave_requests lr
     JOIN users u ON u.id = lr.user_id
     WHERE u.manager_id = ?
     GROUP BY lr.status`,
    [managerId]
  );
  return rows;
}

async function countAll() {
  const [rows] = await pool.query(`SELECT status, COUNT(*) AS count FROM leave_requests GROUP BY status`);
  return rows;
}

async function resetToPending(id) {
  await pool.query(
    `UPDATE leave_requests
     SET status = 'pending', approved_by = NULL, approval_note = NULL, decided_at = NULL
     WHERE id = ?`,
    [id]
  );
}

const ADMIN_SELECT_FIELDS = `
  ${SELECT_FIELDS}, u.full_name AS employee_name,
  d.name AS department_name, m.full_name AS manager_name,
  ab.full_name AS approved_by_name
`;

const ADMIN_JOINS = `
  FROM leave_requests lr
  JOIN leave_types lt ON lt.id = lr.leave_type_id
  JOIN users u ON u.id = lr.user_id
  JOIN departments d ON d.id = u.department_id
  LEFT JOIN users m ON m.id = u.manager_id
  LEFT JOIN users ab ON ab.id = lr.approved_by
`;

async function findAllForAdmin(filters = {}) {
  const { clauses, params } = buildLeaveRequestFilters(filters);
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT ${ADMIN_SELECT_FIELDS} ${ADMIN_JOINS} ${where} ORDER BY lr.created_at DESC`,
    params
  );
  return rows;
}

async function findByIdForAdmin(id) {
  const [rows] = await pool.query(`SELECT ${ADMIN_SELECT_FIELDS} ${ADMIN_JOINS} WHERE lr.id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

async function countDecidedTodayByManager(managerId) {
  const [rows] = await pool.query(
    `SELECT status, COUNT(*) AS count
     FROM leave_requests lr
     WHERE lr.approved_by = ? AND DATE(lr.decided_at) = CURDATE() AND lr.status IN ('approved', 'rejected')
     GROUP BY lr.status`,
    [managerId]
  );
  return rows;
}

async function mostUsedLeaveType() {
  const [rows] = await pool.query(
    `SELECT lt.name, COUNT(*) AS count
     FROM leave_requests lr
     JOIN leave_types lt ON lt.id = lr.leave_type_id
     GROUP BY lt.id, lt.name
     ORDER BY count DESC
     LIMIT 1`
  );
  return rows[0] || null;
}

module.exports = {
  findAllByUserId,
  findById,
  create,
  update,
  cancel,
  findAllByManagerId,
  decide,
  countByUserId,
  countByManagerId,
  countAll,
  resetToPending,
  findAllForAdmin,
  findByIdForAdmin,
  countDecidedTodayByManager,
  mostUsedLeaveType,
};
