const managerStatisticsService = require('../services/managerStatistics.service');

async function getStatistics(req, res) {
  try {
    const { date_from, date_to } = req.query;
    const stats = await managerStatisticsService.getTeamStatistics(req.session.user.id, date_from, date_to);
    res.json(stats);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

module.exports = { getStatistics };
