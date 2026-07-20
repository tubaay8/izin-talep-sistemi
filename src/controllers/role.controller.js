const roleService = require('../services/role.service');

async function list(req, res) {
  try {
    const roles = await roleService.getAllRoles();
    res.json({ roles });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

module.exports = { list };
