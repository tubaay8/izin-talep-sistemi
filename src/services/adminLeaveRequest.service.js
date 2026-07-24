const leaveRequestRepository = require('../repositories/leaveRequest.repository');
const leaveTypeRepository = require('../repositories/leaveType.repository');
const userRepository = require('../repositories/user.repository');
const { assertValidDateRange, assertLeaveTypeExists, assertReportProvided, assertValidTimeRange } = require('../utils/leaveRequestValidators');
const activityLogService = require('./activityLog.service');
const leaveBalanceService = require('./leaveBalance.service');
const mailService = require('./mail.service');
const { toCalendarEvents } = require('../utils/calendarEvent');

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

async function getAllLeaveRequests(filters, pagination) {
  if (pagination && pagination.limit) {
    const [items, total] = await Promise.all([
      leaveRequestRepository.findAllForAdmin(filters, pagination),
      leaveRequestRepository.countFilteredForAdmin(filters),
    ]);
    return {
      items,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / pagination.limit)),
      },
    };
  }
  const items = await leaveRequestRepository.findAllForAdmin(filters);
  return { items, pagination: null };
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

async function updateLeaveRequest(id, { leave_type_id, start_date, end_date, start_time, end_time, reason, report_file }) {
  const existing = await getLeaveRequestById(id);
  assertValidDateRange(start_date, end_date);
  const leaveType = await assertLeaveTypeExists(leave_type_id);
  assertValidTimeRange(leaveType, start_date, end_date, start_time, end_time);

  const effectiveReportFile = report_file !== undefined ? report_file : existing.report_file;
  assertReportProvided(leaveType, effectiveReportFile);

  // Onaylanmis bir talebin tarihi/turu degisiyorsa, bakiyeyi eski degerle
  // serbest birakip yeni degerle tekrar dusmemiz gerekir (aksi halde bakiye sapar).
  if (existing.status === 'approved') {
    const oldLeaveType = await leaveTypeRepository.findById(existing.leave_type_id);
    await leaveBalanceService.adjustBalanceForStatusChange({
      userId: existing.user_id,
      leaveType: oldLeaveType,
      startDate: existing.start_date,
      endDate: existing.end_date,
      startTime: existing.start_time,
      endTime: existing.end_time,
      oldStatus: 'approved',
      newStatus: 'rejected',
    });
    await leaveBalanceService.adjustBalanceForStatusChange({
      userId: existing.user_id,
      leaveType,
      startDate: start_date,
      endDate: end_date,
      startTime: start_time,
      endTime: end_time,
      oldStatus: 'rejected',
      newStatus: 'approved',
    });
  }

  await leaveRequestRepository.update(id, { leave_type_id, start_date, end_date, start_time, end_time, reason, report_file });
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

  const leaveType = await leaveTypeRepository.findById(request.leave_type_id);
  await leaveBalanceService.adjustBalanceForStatusChange({
    userId: request.user_id,
    leaveType,
    startDate: request.start_date,
    endDate: request.end_date,
    startTime: request.start_time,
    endTime: request.end_time,
    oldStatus: request.status,
    newStatus: status,
  });

  await activityLogService.log({
    actorId: adminId,
    actionType: STATUS_ACTION_TYPES[status],
    description: `Izin talebi ${STATUS_DESCRIPTIONS[status]} (admin mudahalesi): ${request.leave_type_name} (${request.employee_name})`,
    targetUserId: request.user_id,
  });

  if (status === 'approved' || status === 'rejected') {
    const employee = await userRepository.findById(request.user_id);
    if (employee && employee.email) {
      // Bilerek await edilmiyor: durum guncelleme isteminin cevabi mail
      // gonderimini beklemeden hemen donmeli (SMTP yavas/erisilemez olsa bile).
      if (status === 'approved') {
        mailService.trySend(
          () =>
            mailService.sendLeaveRequestApprovedEmail({
              to: employee.email,
              employeeName: employee.full_name,
              leaveTypeName: updated.leave_type_name,
              startDate: updated.start_date,
              endDate: updated.end_date,
            }),
          'izin talebi onaylandi bildirimi (admin)'
        );
      } else {
        mailService.trySend(
          () =>
            mailService.sendLeaveRequestRejectedEmail({
              to: employee.email,
              employeeName: employee.full_name,
              leaveTypeName: updated.leave_type_name,
              startDate: updated.start_date,
              endDate: updated.end_date,
              reason: approval_note,
            }),
          'izin talebi reddedildi bildirimi (admin)'
        );
      }
    }
  }

  return updated;
}

async function getCalendarEvents(startDate, endDate, departmentId, status) {
  const requests = await leaveRequestRepository.findCalendarEventsForAdmin(startDate, endDate, departmentId, status);
  return toCalendarEvents(requests);
}

async function bulkUpdateStatus(ids, adminId, { status, approval_note }) {
  if (status === 'rejected' && !approval_note) {
    const error = new Error('Toplu red icin bir gerekce yazmalisiniz');
    error.status = 400;
    throw error;
  }

  const uniqueIds = [...new Set(ids.map((id) => Number(id)))];
  const updatedIds = [];
  const skippedIds = [];

  for (const id of uniqueIds) {
    const request = await leaveRequestRepository.findByIdForAdmin(id);
    if (!request || request.status !== 'pending') {
      skippedIds.push(id);
      continue;
    }
    await updateStatus(id, adminId, { status, approval_note });
    updatedIds.push(id);
  }

  return { updatedCount: updatedIds.length, skippedCount: skippedIds.length, updatedIds, skippedIds };
}

module.exports = {
  getAllLeaveRequests,
  getLeaveRequestById,
  updateLeaveRequest,
  updateStatus,
  bulkUpdateStatus,
  getCalendarEvents,
};
