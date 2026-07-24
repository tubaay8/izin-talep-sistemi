// FullCalendar tüm-gün etkinliklerde bitis tarihini "haric" kabul eder,
// bu yuzden veritabanindaki (dahil) bitis tarihine bir gun ekliyoruz.
function addOneDay(dateStr) {
  const date = new Date(`${dateStr}T00:00:00`);
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

function toCalendarEvent(request) {
  const hourSuffix = request.is_hourly
    ? ` (${String(request.start_time).slice(0, 5)}-${String(request.end_time).slice(0, 5)})`
    : '';
  return {
    id: request.id,
    title: `${request.employee_name} - ${request.leave_type_name}${hourSuffix}`,
    start: request.start_date,
    end: addOneDay(request.end_date),
    allDay: true,
    extendedProps: {
      employeeName: request.employee_name,
      departmentName: request.department_name,
      leaveTypeName: request.leave_type_name,
      status: request.status,
      reason: request.reason || '',
      startDate: request.start_date,
      endDate: request.end_date,
      startTime: request.start_time || null,
      endTime: request.end_time || null,
    },
  };
}

function toCalendarEvents(requests) {
  return requests.map(toCalendarEvent);
}

module.exports = { toCalendarEvents };
