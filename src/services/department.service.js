const departmentRepository = require('../repositories/department.repository');
const userRepository = require('../repositories/user.repository');

async function getAllDepartments() {
  return departmentRepository.findAll();
}

async function getDepartmentById(id) {
  const department = await departmentRepository.findById(id);
  if (!department) {
    const error = new Error('Departman bulunamadi');
    error.status = 404;
    throw error;
  }
  return department;
}

async function assertValidDepartmentManager(managerId, excludeDepartmentId = null) {
  if (!managerId) return null;
  const availableManagers = await userRepository.findAvailableManagers(excludeDepartmentId);
  const isValid = availableManagers.some((manager) => manager.id === Number(managerId));
  if (!isValid) {
    const error = new Error('Gecersiz yonetici veya bu yonetici baska bir departmana atanmis');
    error.status = 400;
    throw error;
  }
  return managerId;
}

function translateDuplicateError(err) {
  const message = err.sqlMessage || err.message || '';
  if (message.includes('uq_departments_manager')) {
    const error = new Error('Bu yonetici zaten baska bir departmana atanmis');
    error.status = 409;
    return error;
  }
  const error = new Error('Bu departman adi zaten kullaniliyor');
  error.status = 409;
  return error;
}

async function createDepartment(name, managerId) {
  const validManagerId = await assertValidDepartmentManager(managerId);
  try {
    const id = await departmentRepository.create(name, validManagerId);
    return departmentRepository.findById(id);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      throw translateDuplicateError(err);
    }
    throw err;
  }
}

async function updateDepartment(id, name, managerId) {
  await getDepartmentById(id);
  const validManagerId = await assertValidDepartmentManager(managerId, id);
  try {
    await departmentRepository.update(id, name, validManagerId);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      throw translateDuplicateError(err);
    }
    throw err;
  }
  return departmentRepository.findById(id);
}

async function deleteDepartment(id) {
  await getDepartmentById(id);
  try {
    await departmentRepository.remove(id);
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
      const error = new Error('Bu departmana bagli kullanicilar oldugu icin silinemez');
      error.status = 409;
      throw error;
    }
    throw err;
  }
}

module.exports = { getAllDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment };
