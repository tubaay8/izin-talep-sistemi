const bcrypt = require('bcrypt');
const userRepository = require('../repositories/user.repository');
const roleRepository = require('../repositories/role.repository');
const departmentRepository = require('../repositories/department.repository');
const { hashPassword } = require('../utils/password');
const activityLogService = require('./activityLog.service');

function toPublicUser(user) {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    profile_photo: user.profile_photo || null,
    role_id: user.role_id,
    role_name: user.role_name,
    department_id: user.department_id,
  };
}

async function register({ full_name, email, password, department_id, manager_id }) {
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    const error = new Error('Bu e-posta adresi zaten kayitli');
    error.status = 409;
    throw error;
  }

  const department = await departmentRepository.findById(department_id);
  if (!department) {
    const error = new Error('Gecersiz departman');
    error.status = 400;
    throw error;
  }

  let validManagerId = null;
  if (manager_id) {
    const managers = await userRepository.findManagers();
    const isValidManager = managers.some((manager) => manager.id === Number(manager_id));
    if (!isValidManager) {
      const error = new Error('Gecersiz yonetici');
      error.status = 400;
      throw error;
    }
    validManagerId = manager_id;
  }

  // Guvenlik: herkese acik kayit formu sadece Personel rolu olusturabilir,
  // Admin/Yonetici rolleri disaridan secilemez.
  const personelRole = await roleRepository.findByName('Personel');
  const passwordHash = await hashPassword(password);

  const userId = await userRepository.create({
    full_name,
    email,
    passwordHash,
    role_id: personelRole.id,
    department_id,
    manager_id: validManagerId,
  });

  await activityLogService.log({
    actorId: userId,
    actionType: activityLogService.ACTION_TYPES.USER_CREATED,
    description: `Yeni kullanici kaydoldu: ${full_name} (Personel)`,
    targetUserId: userId,
  });

  return userId;
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

module.exports = { register, login };
