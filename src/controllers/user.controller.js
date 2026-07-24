const userService = require('../services/user.service');

async function listManagers(req, res) {
  try {
    const managers = await userService.getManagers();
    res.json({ managers });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

async function listAvailableManagers(req, res) {
  try {
    const managers = await userService.getAvailableManagers(req.query.department_id, req.query.exclude_department_id);
    res.json({ managers });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

module.exports = { listManagers, listAvailableManagers };
