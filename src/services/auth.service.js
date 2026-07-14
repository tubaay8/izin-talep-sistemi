const bcrypt = require('bcrypt');
const userRepository = require('../repositories/user.repository');
const { hashPassword } = require('../utils/password');

function toPublicUser(user) {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    profile_photo: user.profile_photo || null,
    role_id: user.role_id,
    role_name: user.role_name,
    department_id: user.department_id,
    must_change_password: Boolean(user.must_change_password),
  };
}

async function login({ email, password }) {
  const user = await userRepository.findByEmail(email);
  if (!user || !user.is_active) {
    const error = new Error('E-posta veya sifre hatali');
    error.status = 401;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    const error = new Error('E-posta veya sifre hatali');
    error.status = 401;
    throw error;
  }

  return toPublicUser(user);
}

async function changePassword(userId, newPassword) {
  const passwordHash = await hashPassword(newPassword);
  await userRepository.updatePasswordAndClearMustChange(userId, passwordHash);
}

module.exports = { login, changePassword };
