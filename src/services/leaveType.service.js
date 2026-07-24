const leaveTypeRepository = require('../repositories/leaveType.repository');
const { toTitleCaseTR } = require('../utils/textFormat');

async function getAllLeaveTypes() {
  return leaveTypeRepository.findAll();
}

async function getLeaveTypeById(id) {
  const leaveType = await leaveTypeRepository.findById(id);
  if (!leaveType) {
    const error = new Error('Izin turu bulunamadi');
    error.status = 404;
    throw error;
  }
  return leaveType;
}

async function createLeaveType({ name, description }) {
  name = toTitleCaseTR(name);
  try {
    const id = await leaveTypeRepository.create({ name, description });
    return leaveTypeRepository.findById(id);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      const error = new Error('Bu izin turu adi zaten kullaniliyor');
      error.status = 409;
      throw error;
    }
    throw err;
  }
}

async function updateLeaveType(id, { name, description }) {
  name = toTitleCaseTR(name);
  await getLeaveTypeById(id);
  try {
    await leaveTypeRepository.update(id, { name, description });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      const error = new Error('Bu izin turu adi zaten kullaniliyor');
      error.status = 409;
      throw error;
    }
    throw err;
  }
  return leaveTypeRepository.findById(id);
}

// Izin turu veritabanindan silinmez, sadece pasife alinir: bu turu kullanan
// gecmis izin talepleri bozulmadan dogru gorunmeye devam eder.
async function deleteLeaveType(id) {
  await getLeaveTypeById(id);
  await leaveTypeRepository.deactivate(id);
}

module.exports = { getAllLeaveTypes, getLeaveTypeById, createLeaveType, updateLeaveType, deleteLeaveType };
