function calculateDayCount(startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}

module.exports = { calculateDayCount };
