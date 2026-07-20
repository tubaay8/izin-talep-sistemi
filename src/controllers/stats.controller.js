const statsService = require('../services/stats.service');
const activityLogService = require('../services/activityLog.service');

async function getDashboardStats(req, res) {
  try {
    const stats = await statsService.getDashboardStats(req.session.user);
    res.json(stats);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

async function getActivities(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { items, pagination } = await activityLogService.getPaginatedActivities(req.session.user, page, limit);
    res.json({ activities: items, pagination });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

module.exports = { getDashboardStats, getActivities };
