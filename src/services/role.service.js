const roleRepository = require('../repositories/role.repository');

async function getAllRoles() {
  return roleRepository.findAll();
}

module.exports = { getAllRoles };
