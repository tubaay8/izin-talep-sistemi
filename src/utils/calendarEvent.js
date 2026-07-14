// FullCalendar tüm-gün etkinliklerde bitis tarihini "haric" kabul eder,
// bu yuzden veritabanindaki (dahil) bitis tarihine bir gun ekliyoruz.
function addOneDay(dateStr) {
  const date = new Date(`${dateStr}T00:00:00`);
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

function toCalendarEvent(request) {
  return {
    id: request.id,
    title: `${request.employee_name} - ${request.leave_type_name}`,
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
    },
  };
}

function toCalendarEvents(requests) {
  return requests.map(toCalendarEvent);
}

module.exports = { toCalendarEvents };
