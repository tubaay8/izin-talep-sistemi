const departmentRepository = require('../repositories/department.repository');

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

async function createDepartment(name) {
  try {
    const id = await departmentRepository.create(name);
    return departmentRepository.findById(id);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      const error = new Error('Bu departman adi zaten kullaniliyor');
      error.status = 409;
      throw error;
    }
    throw err;
  }
}

async function updateDepartment(id, name) {
  await getDepartmentById(id);
  try {
    await departmentRepository.update(id, name);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      const error = new Error('Bu departman adi zaten kullaniliyor');
      error.status = 409;
      throw error;
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
