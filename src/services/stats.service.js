const leaveRequestRepository = require('../repositories/leaveRequest.repository');
const userRepository = require('../repositories/user.repository');
const departmentRepository = require('../repositories/department.repository');
const activityLogService = require('./activityLog.service');
const leaveBalanceService = require('./leaveBalance.service');

const RECENT_ACTIVITIES_LIMIT = 10;

const ALL_STATUSES = ['pending', 'approved', 'rejected', 'cancelled'];

function normalizeStatusCounts(rows, statuses = ALL_STATUSES) {
  const counts = {};
  statuses.forEach((status) => {
    counts[status] = 0;
  });
  rows.forEach((row) => {
    if (counts[row.status] !== undefined) {
      counts[row.status] = Number(row.count);
    }
  });
  return counts;
}

async function getPersonnelDashboard(user) {
  const [statusRows, allRequests, activities, leaveBalance] = await Promise.all([
    leaveRequestRepository.countByUserId(user.id),
    leaveRequestRepository.findAllByUserId(user.id),
    activityLogService.getRecentActivities(user, RECENT_ACTIVITIES_LIMIT),
    leaveBalanceService.getBalanceSummary(user.id),
  ]);

  const counts = normalizeStatusCounts(statusRows);
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return {
    scope: 'own',
    stats: { total, ...counts },
    recent: allRequests.slice(0, 5),
    activities,
    leaveBalance,
  };
}

async function getManagerDashboard(user) {
  const [teamSize, statusRows, todayRows, teamRequests, activities] = await Promise.all([
    userRepository.countByManagerId(user.id),
    leaveRequestRepository.countByManagerId(user.id),
    leaveRequestRepository.countDecidedTodayByManager(user.id),
    leaveRequestRepository.findAllByManagerId(user.id),
    activityLogService.getRecentActivities(user, RECENT_ACTIVITIES_LIMIT),
  ]);

  const counts = normalizeStatusCounts(statusRows);
  const todayCounts = normalizeStatusCounts(todayRows, ['approved', 'rejected']);

  return {
    scope: 'team',
    stats: {
      teamSize,
      pending: counts.pending,
      approvedToday: todayCounts.approved,
      rejectedToday: todayCounts.rejected,
    },
    recent: teamRequests.slice(0, 5),
    activities,
  };
}

async function getAdminDashboard(user) {
  const [totalUsers, activeRows, totalDepartments, statusRows, mostUsedType, recentUsers, allRequests, activities] = await Promise.all([
    userRepository.countTotal(),
    userRepository.countByActiveStatus(),
    departmentRepository.countTotal(),
    leaveRequestRepository.countAll(),
    leaveRequestRepository.mostUsedLeaveType(),
    userRepository.findRecent(5),
    leaveRequestRepository.findAllForAdmin(),
    activityLogService.getRecentActivities(user, RECENT_ACTIVITIES_LIMIT),
  ]);

  const activeCounts = { 1: 0, 0: 0 };
  activeRows.forEach((row) => {
    activeCounts[row.is_active] = Number(row.count);
  });

  const counts = normalizeStatusCounts(statusRows);
  const totalLeaveRequests = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return {
    scope: 'all',
    stats: {
      totalUsers,
      activeUsers: activeCounts[1],
      inactiveUsers: activeCounts[0],
      totalDepartments,
      totalLeaveRequests,
      ...counts,
      mostUsedLeaveType: mostUsedType ? { name: mostUsedType.name, count: Number(mostUsedType.count) } : null,
    },
    recentUsers,
    recentRequests: allRequests.slice(0, 5),
    activities,
  };
}

async function getDashboardStats(user) {
  if (user.role_name === 'Admin') {
    return getAdminDashboard(user);
  }
  if (user.role_name === 'Yonetici') {
    return getManagerDashboard(user);
  }
  return getPersonnelDashboard(user);
}

module.exports = { getDashboardStats };
