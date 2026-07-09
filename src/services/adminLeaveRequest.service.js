const leaveRequestRepository = require('../repositories/leaveRequest.repository');
const { assertValidDateRange, assertLeaveTypeExists, assertReportProvided } = require('../utils/leaveRequestValidators');
const activityLogService = require('./activityLog.service');

const VALID_STATUSES = ['pending', 'approved', 'rejected', 'cancelled'];

const STATUS_ACTION_TYPES = {
  approved: activityLogService.ACTION_TYPES.LEAVE_REQUEST_APPROVED,
  rejected: activityLogService.ACTION_TYPES.LEAVE_REQUEST_REJECTED,
  cancelled: activityLogService.ACTION_TYPES.LEAVE_REQUEST_CANCELLED,
  pending: activityLogService.ACTION_TYPES.LEAVE_REQUEST_REOPENED,
};

const STATUS_DESCRIPTIONS = {
  approved: 'onaylandi',
  rejected: 'reddedildi',
  cancelled: 'iptal edildi',
  pending: 'tekrar beklemeye alindi',
};

async function getAllLeaveRequests(filters) {
  return leaveRequestRepository.findAllForAdmin(filters);
}

async function getLeaveRequestById(id) {
  const request = await leaveRequestRepository.findByIdForAdmin(id);
  if (!request) {
    const error = new Error('Izin talebi bulunamadi');
    error.status = 404;
    throw error;
  }
  return request;
}

async function updateLeaveRequest(id, { leave_type_id, start_date, end_date, reason, report_file }) {
  const existing = await getLeaveRequestById(id);
  assertValidDateRange(start_date, end_date);
  const leaveType = await assertLeaveTypeExists(leave_type_id);

  const effectiveReportFile = report_file !== undefined ? report_file : existing.report_file;
  assertReportProvided(leaveType, effectiveReportFile);

  await leaveRequestRepository.update(id, { leave_type_id, start_date, end_date, reason, report_file });
  return leaveRequestRepository.findById(id);
}

async function updateStatus(id, adminId, { status, approval_note }) {
  const request = await getLeaveRequestById(id);

  if (!VALID_STATUSES.includes(status)) {
    const error = new Error('Gecersiz durum');
    error.status = 400;
    throw error;
  }

  if (status === 'approved' || status === 'rejected') {
    await leaveRequestRepository.decide(id, { status, approved_by: adminId, approval_note });
  } else if (status === 'cancelled') {
    await leaveRequestRepository.cancel(id);
  } else {
    await leaveRequestRepository.resetToPending(id);
  }

  const updated = await leaveRequestRepository.findById(id);

  await activityLogService.log({
    actorId: adminId,
    actionType: STATUS_ACTION_TYPES[status],
    description: `Izin talebi ${STATUS_DESCRIPTIONS[status]} (admin mudahalesi): ${request.leave_type_name} (${request.employee_name})`,
    targetUserId: request.user_id,
  });

  return updated;
}

module.exports = { getAllLeaveRequests, getLeaveRequestById, updateLeaveRequest, updateStatus };
