const adminLeaveRequestService = require('../services/adminLeaveRequest.service');

async function list(req, res) {
  const { status, leave_type_id, date_from, date_to, search, department_id } = req.query;
  const requests = await adminLeaveRequestService.getAllLeaveRequests({
    status,
    leave_type_id,
    date_from,
    date_to,
    search,
    department_id,
  });
  res.json({ requests });
}

async function getOne(req, res) {
  try {
    const request = await adminLeaveRequestService.getLeaveRequestById(req.params.id);
    res.json({ request });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

async function update(req, res) {
  try {
    const { leave_type_id, start_date, end_date, reason } = req.body;
    const report_file = req.file ? req.file.filename : undefined;
    const request = await adminLeaveRequestService.updateLeaveRequest(req.params.id, {
      leave_type_id,
      start_date,
      end_date,
      reason,
      report_file,
    });
    res.json({ message: 'Izin talebi guncellendi', request });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

async function updateStatus(req, res) {
  try {
    const { status, approval_note } = req.body;
    const request = await adminLeaveRequestService.updateStatus(req.params.id, req.session.user.id, {
      status,
      approval_note,
    });
    res.json({ message: 'Durum guncellendi', request });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

module.exports = { list, getOne, update, updateStatus };
