const userRepository = require('../repositories/user.repository');
const roleRepository = require('../repositories/role.repository');
const departmentRepository = require('../repositories/department.repository');
const { hashPassword } = require('../utils/password');
const activityLogService = require('./activityLog.service');

const HR_DEPARTMENT_NAME = 'Insan Kaynaklari';

async function assertRoleExists(role_id) {
  const role = await roleRepository.findById(role_id);
  if (!role) {
    const error = new Error('Gecersiz rol');
    error.status = 400;
    throw error;
  }
  return role;
}

async function assertDepartmentExists(department_id) {
  const department = await departmentRepository.findById(department_id);
  if (!department) {
    const error = new Error('Gecersiz departman');
    error.status = 400;
    throw error;
  }
  return department;
}

async function assertValidManager(manager_id) {
  if (!manager_id) return null;
  const managers = await userRepository.findManagers();
  const isValidManager = managers.some((manager) => manager.id === Number(manager_id));
  if (!isValidManager) {
    const error = new Error('Gecersiz yonetici');
    error.status = 400;
    throw error;
  }
  return manager_id;
}

// Is kurali: her yonetici organizasyonel olarak Insan Kaynaklari departmaninda,
// her personelin yoneticisi ise kendi departmaninin resmi yoneticisiyle ayni olmali.
async function resolveDepartmentAndManager(role, submittedDepartmentId, submittedManagerId) {
  if (role.name === 'Yonetici') {
    const hrDepartment = await departmentRepository.findByName(HR_DEPARTMENT_NAME);
    if (!hrDepartment) {
      const error = new Error(`${HR_DEPARTMENT_NAME} departmani bulunamadi, once bu departmani olusturun`);
      error.status = 400;
      throw error;
    }
    const validManagerId = await assertValidManager(submittedManagerId);
    return { department_id: hrDepartment.id, manager_id: validManagerId };
  }

  const department = await assertDepartmentExists(submittedDepartmentId);

  if (role.name === 'Personel') {
    return { department_id: department.id, manager_id: department.manager_id || null };
  }

  const validManagerId = await assertValidManager(submittedManagerId);
  return { department_id: department.id, manager_id: validManagerId };
}

async function getAllUsers(filters) {
  return userRepository.findAll(filters);
}

async function getUserById(id) {
  const user = await userRepository.findByIdDetailed(id);
  if (!user) {
    const error = new Error('Kullanici bulunamadi');
    error.status = 404;
    throw error;
  }
  return user;
}

async function createUser({ full_name, email, password, role_id, department_id, manager_id }, adminId) {
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    const error = new Error('Bu e-posta adresi zaten kayitli');
    error.status = 409;
    throw error;
  }

  const role = await assertRoleExists(role_id);
  const resolved = await resolveDepartmentAndManager(role, department_id, manager_id);

  const passwordHash = await hashPassword(password);
  const userId = await userRepository.create({
    full_name,
    email,
    passwordHash,
    role_id,
    department_id: resolved.department_id,
    manager_id: resolved.manager_id,
  });

  const created = await userRepository.findByIdDetailed(userId);

  await activityLogService.log({
    actorId: adminId,
    actionType: activityLogService.ACTION_TYPES.USER_CREATED,
    description: `Yeni kullanici olusturuldu: ${created.full_name} (${created.role_name})`,
    targetUserId: userId,
  });

  return created;
}

async function updateUser(id, adminId, { full_name, email, role_id, department_id, manager_id, is_active, password }) {
  const target = await getUserById(id);

  const existing = await userRepository.findByEmail(email);
  if (existing && existing.id !== target.id) {
    const error = new Error('Bu e-posta adresi zaten kayitli');
    error.status = 409;
    throw error;
  }

  const role = await assertRoleExists(role_id);
  const resolved = await resolveDepartmentAndManager(role, department_id, manager_id);

  if (Number(id) === Number(adminId) && (role.name !== 'Admin' || !is_active)) {
    const error = new Error('Kendi hesabinizin rolunu veya aktiflik durumunu bu ekrandan degistiremezsiniz');
    error.status = 400;
    throw error;
  }

  await userRepository.update(id, {
    full_name,
    email,
    role_id,
    department_id: resolved.department_id,
    manager_id: resolved.manager_id,
    is_active: is_active ? 1 : 0,
  });

  if (password) {
    const passwordHash = await hashPassword(password);
    await userRepository.updatePassword(id, passwordHash);
  }

  const updated = await userRepository.findByIdDetailed(id);

  if (Number(target.is_active) !== Number(updated.is_active)) {
    await activityLogService.log({
      actorId: adminId,
      actionType: updated.is_active ? activityLogService.ACTION_TYPES.USER_ACTIVATED : activityLogService.ACTION_TYPES.USER_DEACTIVATED,
      description: `Kullanici ${updated.is_active ? 'aktif' : 'pasif'} hale getirildi: ${updated.full_name}`,
      targetUserId: id,
    });
  }

  if (target.role_id !== updated.role_id) {
    await activityLogService.log({
      actorId: adminId,
      actionType: activityLogService.ACTION_TYPES.USER_ROLE_CHANGED,
      description: `Kullanici rolu degistirildi: ${updated.full_name} (${target.role_name} -> ${updated.role_name})`,
      targetUserId: id,
    });
  }

  if (target.department_id !== updated.department_id) {
    await activityLogService.log({
      actorId: adminId,
      actionType: activityLogService.ACTION_TYPES.USER_DEPARTMENT_CHANGED,
      description: `Kullanici departmani degistirildi: ${updated.full_name} (${target.department_name} -> ${updated.department_name})`,
      targetUserId: id,
    });
  }

  return updated;
}

module.exports = { getAllUsers, getUserById, createUser, updateUser };
