const leaveRequestService = require('../services/leaveRequest.service');
const leaveRequestPdfService = require('../services/leaveRequestPdf.service');
const { buildLeaveFormPdf } = require('../utils/leaveFormPdfBuilder');

async function create(req, res) {
  try {
    const { leave_type_id, start_date, end_date, reason } = req.body;
    const request = await leaveRequestService.createLeaveRequest({
      user_id: req.session.user.id,
      leave_type_id,
      start_date,
      end_date,
      reason,
    });
    res.status(201).json({ message: 'Izin talebi olusturuldu', request });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

async function listMine(req, res) {
  const { status, leave_type_id, date_from, date_to } = req.query;
  const requests = await leaveRequestService.getMyLeaveRequests(req.session.user.id, {
    status,
    leave_type_id,
    date_from,
    date_to,
  });
  res.json({ requests });
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
    const { leave_type_id, start_date, end_date, reason } = req.body;
    const request = await leaveRequestService.updateLeaveRequest(req.params.id, req.session.user.id, {
      leave_type_id,
      start_date,
      end_date,
      reason,
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

module.exports = { create, listMine, getOne, update, cancel, downloadPdf };
