const activityLogRepository = require('../repositories/activityLog.repository');
const userRepository = require('../repositories/user.repository');

const ACTION_TYPES = {
  LEAVE_REQUEST_CREATED: 'leave_request.created',
  LEAVE_REQUEST_UPDATED: 'leave_request.updated',
  LEAVE_REQUEST_CANCELLED: 'leave_request.cancelled',
  LEAVE_REQUEST_APPROVED: 'leave_request.approved',
  LEAVE_REQUEST_REJECTED: 'leave_request.rejected',
  LEAVE_REQUEST_REOPENED: 'leave_request.reopened',
  USER_CREATED: 'user.created',
  USER_ACTIVATED: 'user.activated',
  USER_DEACTIVATED: 'user.deactivated',
  USER_ROLE_CHANGED: 'user.role_changed',
  USER_DEPARTMENT_CHANGED: 'user.department_changed',
};

const DEFAULT_LIMIT = 10;

async function log({ actorId, actionType, description, targetUserId }) {
  const actor = await userRepository.findById(actorId);

  await activityLogRepository.create({
    actor_id: actorId,
    actor_name: actor ? actor.full_name : 'Bilinmeyen Kullanici',
    actor_role: actor ? actor.role_name : 'Bilinmeyen',
    target_user_id: targetUserId || null,
    action_type: actionType,
    description,
  });
}

async function getRecentActivities(user, limit = DEFAULT_LIMIT) {
  if (user.role_name === 'Admin') {
    return activityLogRepository.findRecentGlobal(limit);
  }
  if (user.role_name === 'Yonetici') {
    return activityLogRepository.findRecentForManager(user.id, limit);
  }
  return activityLogRepository.findRecentForUser(user.id, limit);
}

module.exports = { log, getRecentActivities, ACTION_TYPES };
