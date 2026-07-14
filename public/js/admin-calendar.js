const API_URL = '/api/admin/leave-requests/calendar';
const departmentSelect = document.getElementById('filter-department');
const statusSelect = document.getElementById('filter-status');
const leaveTypeSelect = document.getElementById('filter-leave-type');
const searchInput = document.getElementById('filter-search');

function getExtraParams() {
  return { department_id: departmentSelect.value, status: statusSelect.value };
}

async function loadDepartments() {
  const res = await fetch('/api/departments');
  const data = await res.json();
  data.departments.forEach((dept) => {
    const option = document.createElement('option');
    option.value = dept.id;
    option.textContent = dept.name;
    departmentSelect.appendChild(option);
  });
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

[departmentSelect, statusSelect, leaveTypeSelect].forEach((field) => {
  field.addEventListener('change', refresh);
});
searchInput.addEventListener('input', debounceCalendar(refresh, 300));

loadDepartments();
