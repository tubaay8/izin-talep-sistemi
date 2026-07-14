const leaveRequestRepository = require('../repositories/leaveRequest.repository');
const userRepository = require('../repositories/user.repository');
const leaveTypeRepository = require('../repositories/leaveType.repository');
const { assertValidDateRange, assertLeaveTypeExists, assertReportProvided } = require('../utils/leaveRequestValidators');
const activityLogService = require('./activityLog.service');
const leaveBalanceService = require('./leaveBalance.service');
const { toCalendarEvents } = require('../utils/calendarEvent');

async function getOwnedPendingRequest(id, userId) {
  const request = await leaveRequestRepository.findById(id);
  if (!request || request.user_id !== userId) {
    const error = new Error('Izin talebi bulunamadi');
    error.status = 404;
    throw error;
  }
  if (request.status !== 'pending') {
    const error = new Error('Sadece bekleyen talepler duzenlenebilir veya iptal edilebilir');
    error.status = 409;
    throw error;
  }
  return request;
}

async function createLeaveRequest({ user_id, leave_type_id, start_date, end_date, reason, report_file }) {
  assertValidDateRange(start_date, end_date);
  const leaveType = await assertLeaveTypeExists(leave_type_id);
  assertReportProvided(leaveType, report_file);
  await leaveBalanceService.assertSufficientBalance(user_id, leaveType, start_date, end_date);

  const id = await leaveRequestRepository.create({ user_id, leave_type_id, start_date, end_date, reason, report_file });
  const request = await leaveRequestRepository.findById(id);

  await activityLogService.log({
    actorId: user_id,
    actionType: activityLogService.ACTION_TYPES.LEAVE_REQUEST_CREATED,
    description: `Izin talebi olusturuldu: ${request.leave_type_name} (${request.start_date} - ${request.end_date})`,
    targetUserId: user_id,
  });

  return request;
}

async function getMyLeaveRequests(userId, filters) {
  return leaveRequestRepository.findAllByUserId(userId, filters);
}

async function getMyLeaveRequestById(id, userId) {
  const request = await leaveRequestRepository.findById(id);
  if (!request || request.user_id !== userId) {
    const error = new Error('Izin talebi bulunamadi');
    error.status = 404;
    throw error;
  }
  return request;
}

async function updateLeaveRequest(id, userId, { leave_type_id, start_date, end_date, reason, report_file }) {
  assertValidDateRange(start_date, end_date);
  const leaveType = await assertLeaveTypeExists(leave_type_id);
  const existing = await getOwnedPendingRequest(id, userId);

  const effectiveReportFile = report_file !== undefined ? report_file : existing.report_file;
  assertReportProvided(leaveType, effectiveReportFile);

  await leaveRequestRepository.update(id, { leave_type_id, start_date, end_date, reason, report_file });
  const request = await leaveRequestRepository.findById(id);

  await activityLogService.log({
    actorId: userId,
    actionType: activityLogService.ACTION_TYPES.LEAVE_REQUEST_UPDATED,
    description: `Izin talebi guncellendi: ${request.leave_type_name} (${request.start_date} - ${request.end_date})`,
    targetUserId: userId,
  });

  return request;
}

async function cancelLeaveRequest(id, userId) {
  const existing = await getOwnedPendingRequest(id, userId);
  await leaveRequestRepository.cancel(id);
  const request = await leaveRequestRepository.findById(id);

  await activityLogService.log({
    actorId: userId,
    actionType: activityLogService.ACTION_TYPES.LEAVE_REQUEST_CANCELLED,
    description: `Izin talebi iptal edildi: ${existing.leave_type_name}`,
    targetUserId: userId,
  });

  return request;
}

async function attachLeaveBalances(items) {
  if (!items.length) return items;
  const balances = await leaveBalanceService.getBalancesForUsers(items.map((item) => item.user_id));
  return items.map((item) => ({ ...item, leave_balance: balances[item.user_id] }));
}

async function getTeamLeaveRequests(managerId, filters, pagination) {
  if (pagination && pagination.limit) {
    const [rawItems, total] = await Promise.all([
      leaveRequestRepository.findAllByManagerId(managerId, filters, pagination),
      leaveRequestRepository.countFilteredByManagerId(managerId, filters),
    ]);
    const items = await attachLeaveBalances(rawItems);
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
  const rawItems = await leaveRequestRepository.findAllByManagerId(managerId, filters);
  const items = await attachLeaveBalances(rawItems);
  return { items, pagination: null };
}

async function decideLeaveRequest(id, managerId, { decision, approval_note }) {
  const request = await leaveRequestRepository.findById(id);
  if (!request) {
    const error = new Error('Izin talebi bulunamadi');
    error.status = 404;
    throw error;
  }

  const employee = await userRepository.findById(request.user_id);
  if (!employee || employee.manager_id !== managerId) {
    const error = new Error('Bu talep uzerinde yetkiniz yok');
    error.status = 403;
    throw error;
  }

  if (request.status !== 'pending') {
    const error = new Error('Sadece bekleyen talepler onaylanabilir veya reddedilebilir');
    error.status = 409;
    throw error;
  }

  const leaveType = await leaveTypeRepository.findById(request.leave_type_id);

  await leaveRequestRepository.decide(id, { status: decision, approved_by: managerId, approval_note });
  const updated = await leaveRequestRepository.findById(id);

  await leaveBalanceService.adjustBalanceForStatusChange({
    userId: request.user_id,
    leaveType,
    startDate: request.start_date,
    endDate: request.end_date,
    oldStatus: request.status,
    newStatus: decision,
  });

  await activityLogService.log({
    actorId: managerId,
    actionType:
      decision === 'approved' ? activityLogService.ACTION_TYPES.LEAVE_REQUEST_APPROVED : activityLogService.ACTION_TYPES.LEAVE_REQUEST_REJECTED,
    description: `Izin talebi ${decision === 'approved' ? 'onaylandi' : 'reddedildi'}: ${updated.leave_type_name} (${employee.full_name})`,
    targetUserId: request.user_id,
  });

  return updated;
}

async function getTeamCalendarEvents(managerId, startDate, endDate, status) {
  const requests = await leaveRequestRepository.findCalendarEventsForManager(managerId, startDate, endDate, status);
  return toCalendarEvents(requests);
}

module.exports = {
  createLeaveRequest,
  getMyLeaveRequests,
  getMyLeaveRequestById,
  updateLeaveRequest,
  cancelLeaveRequest,
  getTeamLeaveRequests,
  decideLeaveRequest,
  getTeamCalendarEvents,
};
