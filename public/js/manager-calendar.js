const API_URL = '/api/manager/leave-requests/calendar';
const statusSelect = document.getElementById('filter-status');
const leaveTypeSelect = document.getElementById('filter-leave-type');
const searchInput = document.getElementById('filter-search');

function getExtraParams() {
  return { status: statusSelect.value };
}

const calendar = initLeaveCalendar({
  elementId: 'leave-calendar',
  apiUrl: API_URL,
  getExtraParams,
  legendElementId: 'calendar-legend',
  leaveTypeSelectId: 'filter-leave-type',
});

function refresh() {
  refreshLeaveCalendar(calendar, API_URL, getExtraParams);
}

statusSelect.addEventListener('change', refresh);
leaveTypeSelect.addEventListener('change', refresh);
searchInput.addEventListener('input', debounceCalendar(refresh, 300));
