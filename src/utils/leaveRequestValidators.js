const leaveTypeRepository = require('../repositories/leaveType.repository');
const userRepository = require('../repositories/user.repository');
const { timeStringToMinutes } = require('./leaveDayCount');

function assertValidDateRange(start_date, end_date) {
  if (new Date(end_date) < new Date(start_date)) {
    const error = new Error('Bitis tarihi baslangic tarihinden once olamaz');
    error.status = 400;
    throw error;
  }
}

// Saatlik izin turunde talep tek bir gune ait olmali ve gecerli, sirali
// bir saat araligi (baslangic < bitis) icermelidir.
function assertValidTimeRange(leaveType, start_date, end_date, start_time, end_time) {
  if (!leaveType.is_hourly) return;

  if (start_date !== end_date) {
    const error = new Error('Saatlik izin talebi ayni gun icinde olmalidir');
    error.status = 400;
    throw error;
  }
  if (!start_time || !end_time) {
    const error = new Error('Saatlik izin icin baslangic ve bitis saati zorunludur');
    error.status = 400;
    throw error;
  }
  if (timeStringToMinutes(end_time) <= timeStringToMinutes(start_time)) {
    const error = new Error('Bitis saati baslangic saatinden sonra olmalidir');
    error.status = 400;
    throw error;
  }
}

async function assertLeaveTypeExists(leave_type_id) {
  const leaveType = await leaveTypeRepository.findById(leave_type_id);
  if (!leaveType || !leaveType.is_active) {
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

async function assertValidDelegate(delegateUserId, requestingUser) {
  if (!delegateUserId) return;

  if (Number(delegateUserId) === Number(requestingUser.id)) {
    const error = new Error('Kendinizi vekil olarak secemezsiniz');
    error.status = 400;
    throw error;
  }

  const delegate = await userRepository.findById(delegateUserId);
  if (!delegate || !delegate.is_active) {
    const error = new Error('Secilen vekil aktif degil veya bulunamadi');
    error.status = 400;
    throw error;
  }

  if (delegate.department_id !== requestingUser.department_id) {
    const error = new Error('Vekil, sizinle ayni departmanda olmalidir');
    error.status = 400;
    throw error;
  }
}

module.exports = {
  assertValidDateRange,
  assertLeaveTypeExists,
  isReportRequired,
  assertReportProvided,
  assertValidDelegate,
  assertValidTimeRange,
};
