const leaveTypeRepository = require('../repositories/leaveType.repository');

function assertValidDateRange(start_date, end_date) {
  if (new Date(end_date) < new Date(start_date)) {
    const error = new Error('Bitis tarihi baslangic tarihinden once olamaz');
    error.status = 400;
    throw error;
  }
}

async function assertLeaveTypeExists(leave_type_id) {
  const leaveType = await leaveTypeRepository.findById(leave_type_id);
  if (!leaveType) {
    const error = new Error('Gecersiz izin turu');
    error.status = 400;
    throw error;
  }
  return leaveType;
}

// "Hastalik/Hastalık" kelimesinin ı/i, İ/I gibi Turkce harf varyasyonlarindan
// bagimsiz, ascii-guvenli bir alt dize ile eslesip eslesmedigini kontrol eder.
function isReportRequired(leaveTypeName) {
  return Boolean(leaveTypeName) && leaveTypeName.toLowerCase().includes('hastal');
}

function assertReportProvided(leaveType, reportFile) {
  if (isReportRequired(leaveType.name) && !reportFile) {
    const error = new Error('Hastalik izni icin saglik raporu yuklemeniz zorunludur');
    error.status = 400;
    throw error;
  }
}

module.exports = { assertValidDateRange, assertLeaveTypeExists, isReportRequired, assertReportProvided };
