function buildLeaveRequestFilters(filters = {}) {
  const clauses = [];
  const params = [];

  if (filters.status) {
    clauses.push('lr.status = ?');
    params.push(filters.status);
  }
  if (filters.leave_type_id) {
    clauses.push('lr.leave_type_id = ?');
    params.push(filters.leave_type_id);
  }
  if (filters.date_from) {
    clauses.push('lr.start_date >= ?');
    params.push(filters.date_from);
  }
  if (filters.date_to) {
    clauses.push('lr.end_date <= ?');
    params.push(filters.date_to);
  }
  if (filters.search) {
    clauses.push('u.full_name LIKE ?');
    params.push(`%${filters.search}%`);
  }
  if (filters.department_id) {
    clauses.push('u.department_id = ?');
    params.push(filters.department_id);
  }

  return { clauses, params };
}

module.exports = { buildLeaveRequestFilters };
