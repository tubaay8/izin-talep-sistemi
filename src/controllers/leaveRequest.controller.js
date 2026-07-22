const path = require('path');
const leaveRequestService = require('../services/leaveRequest.service');
const leaveRequestPdfService = require('../services/leaveRequestPdf.service');
const { buildLeaveFormPdf } = require('../utils/leaveFormPdfBuilder');

const REPORTS_DIR = path.join(__dirname, '..', '..', 'storage', 'reports');

async function create(req, res) {
  try {
    const { leave_type_id, start_date, end_date, reason, delegate_user_id } = req.body;
    const report_file = req.file ? req.file.filename : undefined;
    const request = await leaveRequestService.createLeaveRequest({
      user_id: req.session.user.id,
      leave_type_id,
      start_date,
      end_date,
      reason,
      report_file,
      delegate_user_id: delegate_user_id || null,
    });
    res.status(201).json({ message: 'Izin talebi olusturuldu', request });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

async function getDelegateCandidates(req, res) {
  try {
    const result = await leaveRequestService.getDelegateCandidates(req.session.user.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

async function listMine(req, res) {
  try {
    const { status, leave_type_id, date_from, date_to } = req.query;
    const requests = await leaveRequestService.getMyLeaveRequests(req.session.user.id, {
      status,
      leave_type_id,
      date_from,
      date_to,
    });
    res.json({ requests });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

async function getConflicts(req, res) {
  try {
    const { start_date, end_date } = req.query;
    const result = await leaveRequestService.getDepartmentConflicts(req.session.user.id, start_date, end_date);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

async function getOne(req, res) {
  try {
    const request = await leaveRequestService.getMyLeaveRequestById(req.params.id, req.session.user.id);
    res.json({ request });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

async function update(req, res) {
  try {
    const { leave_type_id, start_date, end_date, reason, delegate_user_id } = req.body;
    const report_file = req.file ? req.file.filename : undefined;
    const request = await leaveRequestService.updateLeaveRequest(req.params.id, req.session.user.id, {
      leave_type_id,
      start_date,
      end_date,
      reason,
      report_file,
      delegate_user_id: delegate_user_id || null,
    });
    res.json({ message: 'Izin talebi guncellendi', request });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

async function cancel(req, res) {
  try {
    const request = await leaveRequestService.cancelLeaveRequest(req.params.id, req.session.user.id);
    res.json({ message: 'Izin talebi iptal edildi', request });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

async function downloadPdf(req, res) {
  try {
    const request = await leaveRequestPdfService.getLeaveRequestForPdf(req.params.id, req.session.user);
    const doc = buildLeaveFormPdf(request);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="izin-formu-${request.id}.pdf"`);
    doc.pipe(res);
    doc.end();
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

async function downloadReport(req, res) {
  try {
    const request = await leaveRequestPdfService.getLeaveRequestForPdf(req.params.id, req.session.user);
    if (!request.report_file) {
      return res.status(404).json({ message: 'Bu talebe ait rapor bulunamiyor' });
    }
    res.sendFile(path.join(REPORTS_DIR, request.report_file));
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

module.exports = {
  create,
  listMine,
  getConflicts,
  getDelegateCandidates,
  getOne,
  update,
  cancel,
  downloadPdf,
  downloadReport,
};
