const leaveBalanceRepository = require('../repositories/leaveBalance.repository');
const leaveRequestRepository = require('../repositories/leaveRequest.repository');
const { calculateDayCount, calculateMinuteCount, WORKDAY_MINUTES } = require('../utils/leaveDayCount');

const DEFAULT_ENTITLED_DAYS = 14;

function currentYear() {
  return new Date().getFullYear();
}

function yearOf(dateStr) {
  return new Date(`${dateStr}T00:00:00`).getFullYear();
}

// Gun bazli bir izin "1 gun = WORKDAY_MINUTES dakika" olarak, saatlik bir izin
// ise gercek saat farkiyla ayni dakika birimine cevrilir; boylece ikisi de
// tek bir havuzda (used_days + pending_minutes) tutulabilir.
function requestMinuteCount(leaveType, { startDate, endDate, startTime, endTime }) {
  if (leaveType.is_hourly) {
    return calculateMinuteCount(startTime, endTime);
  }
  return calculateDayCount(startDate, endDate) * WORKDAY_MINUTES;
}

function totalMinutesOf(balance) {
  return balance.used_days * WORKDAY_MINUTES + balance.pending_minutes;
}

function minutesToUsage(totalMinutes) {
  const clamped = Math.max(0, totalMinutes);
  return {
    used_days: Math.floor(clamped / WORKDAY_MINUTES),
    pending_minutes: clamped % WORKDAY_MINUTES,
  };
}

async function computeInitialUsage(userId, year) {
  const approvedRequests = await leaveRequestRepository.findApprovedQuotaRequestsForUserYear(userId, year);
  const totalMinutes = approvedRequests.reduce((sum, r) => {
    if (r.is_hourly) return sum + calculateMinuteCount(r.start_time, r.end_time);
    return sum + calculateDayCount(r.start_date, r.end_date) * WORKDAY_MINUTES;
  }, 0);
  return minutesToUsage(totalMinutes);
}

// Ilgili yil icin bakiye kaydi yoksa, o kullanicinin daha once onaylanmis
// gun/saat bazli izinlerini sayarak dogru bir baslangic degeriyle olusturur.
async function getOrCreateBalance(userId, year) {
  const existing = await leaveBalanceRepository.findByUserAndYear(userId, year);
  if (existing) return existing;

  const usage = await computeInitialUsage(userId, year);
  try {
    const id = await leaveBalanceRepository.create({
      user_id: userId,
      year,
      entitled_days: DEFAULT_ENTITLED_DAYS,
      used_days: usage.used_days,
      pending_minutes: usage.pending_minutes,
    });
    return { id, user_id: userId, year, entitled_days: DEFAULT_ENTITLED_DAYS, ...usage };
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      const race = await leaveBalanceRepository.findByUserAndYear(userId, year);
      if (race) return race;
    }
    throw err;
  }
}

async function getBalanceSummary(userId, year = currentYear()) {
  const balance = await getOrCreateBalance(userId, year);
  const remainingMinutes = Math.max(0, balance.entitled_days * WORKDAY_MINUTES - totalMinutesOf(balance));
  return {
    year: balance.year,
    entitledDays: balance.entitled_days,
    usedDays: balance.used_days,
    pendingHours: Math.round((balance.pending_minutes / 60) * 10) / 10,
    remainingDays: Math.floor(remainingMinutes / WORKDAY_MINUTES),
    remainingHours: Math.round(((remainingMinutes % WORKDAY_MINUTES) / 60) * 10) / 10,
  };
}

async function getBalancesForUsers(userIds, year = currentYear()) {
  const uniqueIds = [...new Set(userIds)];
  const summaries = await Promise.all(uniqueIds.map((id) => getBalanceSummary(id, year)));
  const map = {};
  uniqueIds.forEach((id, index) => {
    map[id] = summaries[index];
  });
  return map;
}

async function assertSufficientBalance(userId, leaveType, requestRange) {
  if (!leaveType.counts_toward_quota) return;

  const requiredMinutes = requestMinuteCount(leaveType, requestRange);
  const balance = await getOrCreateBalance(userId, yearOf(requestRange.startDate));
  const remainingMinutes = balance.entitled_days * WORKDAY_MINUTES - totalMinutesOf(balance);

  if (requiredMinutes > remainingMinutes) {
    const remainingDays = Math.floor(Math.max(0, remainingMinutes) / WORKDAY_MINUTES);
    const remainingHours = Math.round(((Math.max(0, remainingMinutes) % WORKDAY_MINUTES) / 60) * 10) / 10;
    const requestedLabel = leaveType.is_hourly
      ? `${Math.round((requiredMinutes / 60) * 10) / 10} saat`
      : `${requiredMinutes / WORKDAY_MINUTES} gun`;
    const error = new Error(
      `Yetersiz izin bakiyesi. Kalan izin hakkiniz: ${remainingDays} gun ${remainingHours} saat, talep edilen: ${requestedLabel}`
    );
    error.status = 400;
    throw error;
  }
}

// Bir talebin durumu degistiginde (onay/red/iptal/yeniden beklemeye alma)
// bakiyeyi tutarli tutar: sadece "onaylandi" durumuna girilirken duser,
// "onaylandi" durumundan cikilirken geri eklenir. Gun ve saatlik izinler
// ayni dakika cinsinden tek bir havuzda (used_days + pending_minutes) tutulur.
async function adjustBalanceForStatusChange({ userId, leaveType, startDate, endDate, startTime, endTime, oldStatus, newStatus }) {
  if (!leaveType.counts_toward_quota) return;

  const wasApproved = oldStatus === 'approved';
  const isApproved = newStatus === 'approved';
  if (wasApproved === isApproved) return;

  const requiredMinutes = requestMinuteCount(leaveType, { startDate, endDate, startTime, endTime });
  const balance = await getOrCreateBalance(userId, yearOf(startDate));
  const delta = isApproved ? requiredMinutes : -requiredMinutes;
  const usage = minutesToUsage(totalMinutesOf(balance) + delta);

  await leaveBalanceRepository.setUsage(balance.id, usage);
}

module.exports = {
  getBalanceSummary,
  getBalancesForUsers,
  assertSufficientBalance,
  adjustBalanceForStatusChange,
};
