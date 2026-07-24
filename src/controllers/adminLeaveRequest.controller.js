const adminLeaveRequestService = require('../services/adminLeaveRequest.service');

async function list(req, res) {
  try {
    const { status, leave_type_id, date_from, date_to, search, department_id, page, limit } = req.query;
    const pagination = page && limit ? { page: Number(page), limit: Number(limit) } : null;
    const { items, pagination: paginationResult } = await adminLeaveRequestService.getAllLeaveRequests(
      { status, leave_type_id, date_from, date_to, search, department_id },
      pagination
    );
    const response = { requests: items };
    if (paginationResult) response.pagination = paginationResult;
    res.json(response);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

async function calendar(req, res) {
  try {
    const { start, end, department_id, status } = req.query;
    const events = await adminLeaveRequestService.getCalendarEvents(start, end, department_id, status);
    res.json({ events });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
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
    const { leave_type_id, start_date, end_date, start_time, end_time, reason } = req.body;
    const report_file = req.file ? req.file.filename : undefined;
    const request = await adminLeaveRequestService.updateLeaveRequest(req.params.id, {
      leave_type_id,
      start_date,
      end_date,
      start_time: start_time || null,
      end_time: end_time || null,
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

async function bulkUpdateStatus(req, res) {
  try {
    const { ids, status, approval_note } = req.body;
    const result = await adminLeaveRequestService.bulkUpdateStatus(ids, req.session.user.id, { status, approval_note });
    res.json({ message: 'Toplu islem tamamlandi', ...result });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

module.exports = { list, getOne, update, updateStatus, bulkUpdateStatus, calendar };
