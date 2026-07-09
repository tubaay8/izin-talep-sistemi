const homeService = require('../services/home.service');

async function getStatus(req, res) {
  const status = await homeService.getSystemStatus();
  res.json(status);
}

module.exports = { getStatus };
