function calculateDayCount(startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}

// Bir is gunu = 9 saat = 540 dakika. Saatlik izinler bu birime gore
// bakiyeden dusulur (bkz. leaveBalance.service.js).
const WORKDAY_MINUTES = 9 * 60;

function timeStringToMinutes(value) {
  const [hours, minutes] = String(value).split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

function calculateMinuteCount(startTime, endTime) {
  const minutes = timeStringToMinutes(endTime) - timeStringToMinutes(startTime);
  return minutes;
}

module.exports = { calculateDayCount, calculateMinuteCount, timeStringToMinutes, WORKDAY_MINUTES };
