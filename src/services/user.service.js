const userRepository = require('../repositories/user.repository');

async function getManagers() {
  return userRepository.findManagers();
}

module.exports = { getManagers };
