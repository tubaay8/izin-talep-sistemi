const leaveBalanceRepository = require('../repositories/leaveBalance.repository');
const leaveRequestRepository = require('../repositories/leaveRequest.repository');
const { calculateDayCount } = require('../utils/leaveDayCount');

const DEFAULT_ENTITLED_DAYS = 14;

function currentYear() {
  return new Date().getFullYear();
}

function yearOf(dateStr) {
  return new Date(`${dateStr}T00:00:00`).getFullYear();
}

async function computeInitialUsedDays(userId, year) {
  const approvedRequests = await leaveRequestRepository.findApprovedQuotaRequestsForUserYear(userId, year);
  return approvedRequests.reduce((sum, r) => sum + calculateDayCount(r.start_date, r.end_date), 0);
}

// Ilgili yil icin bakiye kaydi yoksa, o kullanicinin daha once onaylanmis
// yillik izin gunlerini sayarak dogru bir baslangic degeriyle olusturur.
async function getOrCreateBalance(userId, year) {
  const existing = await leaveBalanceRepository.findByUserAndYear(userId, year);
  if (existing) return existing;

  const usedDays = await computeInitialUsedDays(userId, year);
  try {
    const id = await leaveBalanceRepository.create({
      user_id: userId,
      year,
      entitled_days: DEFAULT_ENTITLED_DAYS,
      used_days: usedDays,
    });
    return { id, user_id: userId, year, entitled_days: DEFAULT_ENTITLED_DAYS, used_days: usedDays };
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
  return {
    year: balance.year,
    entitledDays: balance.entitled_days,
    usedDays: balance.used_days,
    remainingDays: balance.entitled_days - balance.used_days,
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

async function assertSufficientBalance(userId, leaveType, startDate, endDate) {
  if (!leaveType.counts_toward_quota) return;

  const days = calculateDayCount(startDate, endDate);
  const balance = await getOrCreateBalance(userId, yearOf(startDate));
  const remaining = balance.entitled_days - balance.used_days;

  if (days > remaining) {
    const error = new Error(`Yetersiz izin bakiyesi. Kalan izin hakkiniz: ${remaining} gun, talep edilen: ${days} gun`);
    error.status = 400;
    throw error;
  }
}

// Bir talebin durumu degistiginde (onay/red/iptal/yeniden beklemeye alma)
// bakiyeyi tutarli tutar: sadece "onaylandi" durumuna girilirken duser,
// "onaylandi" durumundan cikilirken geri eklenir.
async function adjustBalanceForStatusChange({ userId, leaveType, startDate, endDate, oldStatus, newStatus }) {
  if (!leaveType.counts_toward_quota) return;

  const wasApproved = oldStatus === 'approved';
  const isApproved = newStatus === 'approved';
  if (wasApproved === isApproved) return;

  const days = calculateDayCount(startDate, endDate);
  const balance = await getOrCreateBalance(userId, yearOf(startDate));

  if (isApproved) {
    await leaveBalanceRepository.incrementUsedDays(balance.id, days);
  } else {
    await leaveBalanceRepository.decrementUsedDays(balance.id, days);
  }
}

module.exports = {
  getBalanceSummary,
  getBalancesForUsers,
  assertSufficientBalance,
  adjustBalanceForStatusChange,
};
