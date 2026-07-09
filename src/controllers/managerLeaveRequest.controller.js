const leaveRequestService = require('../services/leaveRequest.service');

async function listTeamRequests(req, res) {
  const { status, leave_type_id, date_from, date_to, search, department_id } = req.query;
  const requests = await leaveRequestService.getTeamLeaveRequests(req.session.user.id, {
    status,
    leave_type_id,
    date_from,
    date_to,
    search,
    department_id,
  });
  res.json({ requests });
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

module.exports = { listTeamRequests, decide };
