const userRepository = require('../repositories/user.repository');

async function getManagers() {
  return userRepository.findManagers();
}

async function getAvailableManagers(departmentId, excludeDepartmentId) {
  return userRepository.findAvailableManagers(departmentId || null, excludeDepartmentId || null);
}

module.exports = { getManagers, getAvailableManagers };
