const leaveRequestRepository = require('../repositories/leaveRequest.repository');
const userRepository = require('../repositories/user.repository');
const leaveTypeRepository = require('../repositories/leaveType.repository');
const { assertValidDateRange, assertLeaveTypeExists, assertReportProvided, assertValidDelegate, assertValidTimeRange } = require('../utils/leaveRequestValidators');
const activityLogService = require('./activityLog.service');
const leaveBalanceService = require('./leaveBalance.service');
const mailService = require('./mail.service');
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

async function createLeaveRequest({ user_id, leave_type_id, start_date, end_date, start_time, end_time, reason, report_file, delegate_user_id }) {
  assertValidDateRange(start_date, end_date);
  const leaveType = await assertLeaveTypeExists(leave_type_id);
  assertReportProvided(leaveType, report_file);
  assertValidTimeRange(leaveType, start_date, end_date, start_time, end_time);
  await leaveBalanceService.assertSufficientBalance(user_id, leaveType, { startDate: start_date, endDate: end_date, startTime: start_time, endTime: end_time });

  const requestingUser = await userRepository.findById(user_id);
  await assertValidDelegate(delegate_user_id, requestingUser);

  const id = await leaveRequestRepository.create({
    user_id,
    leave_type_id,
    start_date,
    end_date,
    start_time,
    end_time,
    reason,
    report_file,
    delegate_user_id,
  });
  const request = await leaveRequestRepository.findById(id);

  await activityLogService.log({
    actorId: user_id,
    actionType: activityLogService.ACTION_TYPES.LEAVE_REQUEST_CREATED,
    description: `Izin talebi olusturuldu: ${request.leave_type_name} (${request.start_date} - ${request.end_date})`,
    targetUserId: user_id,
  });

  if (requestingUser.manager_id) {
    const manager = await userRepository.findById(requestingUser.manager_id);
    if (manager && manager.email) {
      // Bilerek await edilmiyor: mail gonderimi yavas/basarisiz olsa bile
      // izin talebi olusturma isteminin cevabi beklemeden donmeli.
      mailService.trySend(
        () =>
          mailService.sendLeaveRequestCreatedEmail({
            to: manager.email,
            managerName: manager.full_name,
            employeeName: requestingUser.full_name,
            leaveTypeName: request.leave_type_name,
            startDate: request.start_date,
            endDate: request.end_date,
            reason: request.reason,
          }),
        'izin talebi olusturuldu - yonetici bildirimi'
      );
    }
  }

  if (delegate_user_id) {
    const delegate = await userRepository.findById(delegate_user_id);
    if (delegate && delegate.email) {
      mailService.trySend(
        () =>
          mailService.sendDelegateAssignedEmail({
            to: delegate.email,
            delegateName: delegate.full_name,
            employeeName: requestingUser.full_name,
            leaveTypeName: request.leave_type_name,
            startDate: request.start_date,
            endDate: request.end_date,
          }),
        'vekalet atamasi bildirimi'
      );
    }
  }

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

async function updateLeaveRequest(id, userId, { leave_type_id, start_date, end_date, start_time, end_time, reason, report_file, delegate_user_id }) {
  assertValidDateRange(start_date, end_date);
  const leaveType = await assertLeaveTypeExists(leave_type_id);
  assertValidTimeRange(leaveType, start_date, end_date, start_time, end_time);
  const existing = await getOwnedPendingRequest(id, userId);

  const effectiveReportFile = report_file !== undefined ? report_file : existing.report_file;
  assertReportProvided(leaveType, effectiveReportFile);

  const requestingUser = await userRepository.findById(userId);
  await assertValidDelegate(delegate_user_id, requestingUser);

  await leaveRequestRepository.update(id, { leave_type_id, start_date, end_date, start_time, end_time, reason, report_file, delegate_user_id });
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
    startTime: request.start_time,
    endTime: request.end_time,
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

  if (employee.email) {
    // Bilerek await edilmiyor: karar isteminin cevabi mail gonderimini
    // beklemeden hemen donmeli (SMTP yavas/erisilemez olsa bile).
    if (decision === 'approved') {
      mailService.trySend(
        () =>
          mailService.sendLeaveRequestApprovedEmail({
            to: employee.email,
            employeeName: employee.full_name,
            leaveTypeName: updated.leave_type_name,
            startDate: updated.start_date,
            endDate: updated.end_date,
          }),
        'izin talebi onaylandi bildirimi'
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
        'izin talebi reddedildi bildirimi'
      );
    }
  }

  return updated;
}

async function bulkDecideLeaveRequests(ids, managerId, { decision, approval_note }) {
  if (decision === 'rejected' && !approval_note) {
    const error = new Error('Toplu red icin bir gerekce yazmalisiniz');
    error.status = 400;
    throw error;
  }

  const uniqueIds = [...new Set(ids.map((id) => Number(id)))];
  const updatedIds = [];
  const skippedIds = [];

  for (const id of uniqueIds) {
    try {
      await decideLeaveRequest(id, managerId, { decision, approval_note });
      updatedIds.push(id);
    } catch (err) {
      skippedIds.push(id);
    }
  }

  return { updatedCount: updatedIds.length, skippedCount: skippedIds.length, updatedIds, skippedIds };
}

async function getTeamCalendarEvents(managerId, startDate, endDate, status) {
  const requests = await leaveRequestRepository.findCalendarEventsForManager(managerId, startDate, endDate, status);
  return toCalendarEvents(requests);
}

async function getDelegateCandidates(userId) {
  const user = await userRepository.findByIdDetailed(userId);
  if (!user || !user.department_id) {
    return { candidates: [] };
  }
  const candidates = await userRepository.findActiveByDepartmentId(user.department_id, userId);
  return { candidates };
}

async function getDepartmentConflicts(userId, startDate, endDate) {
  assertValidDateRange(startDate, endDate);
  const user = await userRepository.findByIdDetailed(userId);
  if (!user || !user.department_id) {
    return { departmentName: null, conflicts: [], totalOnLeave: 0 };
  }

  const conflicts = await leaveRequestRepository.findDepartmentConflicts(user.department_id, userId, startDate, endDate);

  return {
    departmentName: user.department_name,
    conflicts,
    totalOnLeave: conflicts.length + 1,
  };
}

module.exports = {
  createLeaveRequest,
  getMyLeaveRequests,
  getMyLeaveRequestById,
  updateLeaveRequest,
  cancelLeaveRequest,
  getTeamLeaveRequests,
  decideLeaveRequest,
  bulkDecideLeaveRequests,
  getTeamCalendarEvents,
  getDepartmentConflicts,
  getDelegateCandidates,
};
