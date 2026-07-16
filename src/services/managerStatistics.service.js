const leaveRequestRepository = require('../repositories/leaveRequest.repository');

function countDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.round((end - start) / 86400000) + 1;
}

function buildOverview(requests) {
  return {
    total: requests.length,
    approved: requests.filter((r) => r.status === 'approved').length,
    pending: requests.filter((r) => r.status === 'pending').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  };
}

function buildEmployeeAggregates(requests) {
  const employeeMap = new Map();

  requests.forEach((r) => {
    if (!employeeMap.has(r.employee_name)) {
      employeeMap.set(r.employee_name, {
        employeeName: r.employee_name,
        departmentName: r.department_name,
        totalDays: 0,
        requestCount: 0,
        leaveTypes: new Set(),
      });
    }
    const entry = employeeMap.get(r.employee_name);
    entry.totalDays += countDays(r.start_date, r.end_date);
    entry.requestCount += 1;
    entry.leaveTypes.add(r.leave_type_name);
  });

  return Array.from(employeeMap.values()).sort((a, b) => b.totalDays - a.totalDays);
}

function buildLeaveTypeAggregates(requests) {
  const typeMap = new Map();

  requests.forEach((r) => {
    if (!typeMap.has(r.leave_type_name)) {
      typeMap.set(r.leave_type_name, { name: r.leave_type_name, count: 0, totalDays: 0, people: new Set() });
    }
    const entry = typeMap.get(r.leave_type_name);
    entry.count += 1;
    entry.totalDays += countDays(r.start_date, r.end_date);
    entry.people.add(r.employee_name);
  });

  return Array.from(typeMap.values());
}

function buildDailyIntensity(requests, dateFrom, dateTo) {
  if (!dateFrom || !dateTo) return [];

  const dayMap = new Map();
  requests.forEach((r) => {
    const cur = new Date(r.start_date);
    const end = new Date(r.end_date);
    while (cur <= end) {
      const key = cur.toISOString().slice(0, 10);
      dayMap.set(key, (dayMap.get(key) || 0) + 1);
      cur.setDate(cur.getDate() + 1);
    }
  });

  const series = [];
  const cur = new Date(dateFrom);
  const end = new Date(dateTo);
  while (cur <= end) {
    const key = cur.toISOString().slice(0, 10);
    series.push({ date: key, count: dayMap.get(key) || 0 });
    cur.setDate(cur.getDate() + 1);
  }
  return series;
}

async function getTeamStatistics(managerId, dateFrom, dateTo) {
  const allRequests = await leaveRequestRepository.findAllByManagerId(managerId, { date_from: dateFrom, date_to: dateTo });
  const requests = allRequests.filter((r) => r.status !== 'cancelled');

  const overview = buildOverview(requests);
  const employeeAggregates = buildEmployeeAggregates(requests);
  const leaveTypeAggregates = buildLeaveTypeAggregates(requests);

  const employeeUsage = employeeAggregates.map((e) => ({ employeeName: e.employeeName, totalDays: e.totalDays }));

  const topEmployees = employeeAggregates.map((e) => ({
    employeeName: e.employeeName,
    departmentName: e.departmentName,
    totalDays: e.totalDays,
    leaveTypes: Array.from(e.leaveTypes).join(', '),
    requestCount: e.requestCount,
  }));

  const leaveTypeDistribution = leaveTypeAggregates
    .map((t) => ({
      name: t.name,
      count: t.count,
      percentage: requests.length ? Math.round((t.count / requests.length) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const topLeaveTypes = leaveTypeAggregates
    .map((t) => ({ name: t.name, peopleCount: t.people.size, totalDays: t.totalDays }))
    .sort((a, b) => b.peopleCount - a.peopleCount)
    .slice(0, 5);

  const dailyIntensity = buildDailyIntensity(requests, dateFrom, dateTo);

  return { overview, employeeUsage, leaveTypeDistribution, dailyIntensity, topLeaveTypes, topEmployees };
}

module.exports = { getTeamStatistics };
