const adminUserService = require('../services/adminUser.service');

async function list(req, res) {
  try {
    const { search, role_id, department_id, is_active, page, limit } = req.query;
    const pagination = page && limit ? { page: Number(page), limit: Number(limit) } : null;
    const { items, pagination: paginationResult } = await adminUserService.getAllUsers(
      { search, role_id, department_id, is_active },
      pagination
    );
    const response = { users: items };
    if (paginationResult) response.pagination = paginationResult;
    res.json(response);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

async function getOne(req, res) {
  try {
    const user = await adminUserService.getUserById(req.params.id);
    res.json({ user });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

async function create(req, res) {
  try {
    const { full_name, email, role_id, department_id, manager_id } = req.body;
    const user = await adminUserService.createUser(
      { full_name, email, role_id, department_id, manager_id },
      req.session.user.id
    );
    res.status(201).json({ message: 'Kullanici olusturuldu', user });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

async function update(req, res) {
  try {
    const { full_name, email, role_id, department_id, manager_id, is_active, password } = req.body;
    const user = await adminUserService.updateUser(req.params.id, req.session.user.id, {
      full_name,
      email,
      role_id,
      department_id,
      manager_id,
      is_active,
      password,
    });
    res.json({ message: 'Kullanici guncellendi', user });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

module.exports = { list, getOne, create, update };
