const leaveTypeService = require('../services/leaveType.service');

async function list(req, res) {
  try {
    const leaveTypes = await leaveTypeService.getAllLeaveTypes();
    res.json({ leaveTypes });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

async function create(req, res) {
  try {
    const { name, description } = req.body;
    const leaveType = await leaveTypeService.createLeaveType({ name, description });
    res.status(201).json({ message: 'Izin turu olusturuldu', leaveType });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

async function update(req, res) {
  try {
    const { name, description } = req.body;
    const leaveType = await leaveTypeService.updateLeaveType(req.params.id, { name, description });
    res.json({ message: 'Izin turu guncellendi', leaveType });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

async function remove(req, res) {
  try {
    await leaveTypeService.deleteLeaveType(req.params.id);
    res.json({ message: 'Izin turu silindi' });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

module.exports = { list, create, update, remove };
