const userRepository = require('../repositories/user.repository');

async function getManagers() {
  return userRepository.findManagers();
}

async function getAvailableManagers(excludeDepartmentId) {
  return userRepository.findAvailableManagers(excludeDepartmentId || null);
}

module.exports = { getManagers, getAvailableManagers };
