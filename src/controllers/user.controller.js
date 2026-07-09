const userService = require('../services/user.service');

async function listManagers(req, res) {
  const managers = await userService.getManagers();
  res.json({ managers });
}

module.exports = { listManagers };
