const departmentService = require('../services/department.service');

async function list(req, res) {
  const departments = await departmentService.getAllDepartments();
  res.json({ departments });
}

async function create(req, res) {
  try {
    const department = await departmentService.createDepartment(req.body.name, req.body.manager_id);
    res.status(201).json({ message: 'Departman olusturuldu', department });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

async function update(req, res) {
  try {
    const department = await departmentService.updateDepartment(req.params.id, req.body.name, req.body.manager_id);
    res.json({ message: 'Departman guncellendi', department });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

async function remove(req, res) {
  try {
    await departmentService.deleteDepartment(req.params.id);
    res.json({ message: 'Departman silindi' });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

module.exports = { list, create, update, remove };
