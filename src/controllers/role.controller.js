const roleService = require('../services/role.service');

async function list(req, res) {
  const roles = await roleService.getAllRoles();
  res.json({ roles });
}

module.exports = { list };
