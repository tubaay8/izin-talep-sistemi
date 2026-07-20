const homeService = require('../services/home.service');

async function getStatus(req, res) {
  try {
    const status = await homeService.getSystemStatus();
    res.json(status);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

module.exports = { getStatus };
