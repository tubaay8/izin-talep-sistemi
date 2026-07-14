const statsService = require('../services/stats.service');
const activityLogService = require('../services/activityLog.service');

async function getDashboardStats(req, res) {
  const stats = await statsService.getDashboardStats(req.session.user);
  res.json(stats);
}

async function getActivities(req, res) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { items, pagination } = await activityLogService.getPaginatedActivities(req.session.user, page, limit);
  res.json({ activities: items, pagination });
}

module.exports = { getDashboardStats, getActivities };
