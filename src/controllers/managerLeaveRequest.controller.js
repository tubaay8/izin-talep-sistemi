const leaveRequestService = require('../services/leaveRequest.service');

async function listTeamRequests(req, res) {
  const { status, leave_type_id, date_from, date_to, search, department_id, page, limit } = req.query;
  const pagination = page && limit ? { page: Number(page), limit: Number(limit) } : null;
  const { items, pagination: paginationResult } = await leaveRequestService.getTeamLeaveRequests(
    req.session.user.id,
    { status, leave_type_id, date_from, date_to, search, department_id },
    pagination
  );
  const response = { requests: items };
  if (paginationResult) response.pagination = paginationResult;
  res.json(response);
}

async function calendar(req, res) {
  try {
    const { start, end, status } = req.query;
    const events = await leaveRequestService.getTeamCalendarEvents(req.session.user.id, start, end, status);
    res.json({ events });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

async function decide(req, res) {
  try {
    const { decision, approval_note } = req.body;
    const request = await leaveRequestService.decideLeaveRequest(req.params.id, req.session.user.id, {
      decision,
      approval_note,
    });
    res.json({ message: 'Karar kaydedildi', request });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

module.exports = { listTeamRequests, decide, calendar };
