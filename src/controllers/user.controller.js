const userService = require('../services/user.service');

async function listManagers(req, res) {
  const managers = await userService.getManagers();
  res.json({ managers });
}

async function listAvailableManagers(req, res) {
  const managers = await userService.getAvailableManagers(req.query.exclude_department_id);
  res.json({ managers });
}

module.exports = { listManagers, listAvailableManagers };
