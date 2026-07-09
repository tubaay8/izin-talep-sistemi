const statsService = require('../services/stats.service');

async function getDashboardStats(req, res) {
  const stats = await statsService.getDashboardStats(req.session.user);
  res.json(stats);
}

module.exports = { getDashboardStats };
