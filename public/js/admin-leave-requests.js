const STATUS_LABELS = {
  pending: 'Bekliyor',
  approved: 'Onaylandi',
  rejected: 'Reddedildi',
  cancelled: 'Iptal Edildi',
};

const tbody = document.getElementById('requests-body');
const messageEl = document.getElementById('list-message');
const filterSearch = document.getElementById('filter-search');
const filterDepartment = document.getElementById('filter-department');
const filterStatus = document.getElementById('filter-status');
const filterLeaveType = document.getElementById('filter-leave-type');
const filterDateFrom = document.getElementById('filter-date-from');
const filterDateTo = document.getElementById('filter-date-to');
const filterClear = document.getElementById('filter-clear');

async function loadFilterOptions() {
  const [leaveTypesRes, departmentsRes] = await Promise.all([fetch('/api/leave-types'), fetch('/api/departments')]);
  const leaveTypesData = await leaveTypesRes.json();
  const departmentsData = await departmentsRes.json();

  leaveTypesData.leaveTypes.forEach((type) => {
    const option = document.createElement('option');
    option.value = type.id;
    option.textContent = type.name;
    filterLeaveType.appendChild(option);
  });

  departmentsData.departments.forEach((dept) => {
    const option = document.createElement('option');
    option.value = dept.id;
    option.textContent = dept.name;
    filterDepartment.appendChild(option);
  });
}

function buildFilterQuery() {
  const params = new URLSearchParams();
  if (filterSearch.value.trim()) params.set('search', filterSearch.value.trim());
  if (filterDepartment.value) params.set('department_id', filterDepartment.value);
  if (filterStatus.value) params.set('status', filterStatus.value);
  if (filterLeaveType.value) params.set('leave_type_id', filterLeaveType.value);
  if (filterDateFrom.value) params.set('date_from', filterDateFrom.value);
  if (filterDateTo.value) params.set('date_to', filterDateTo.value);
  return params.toString();
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('tr-TR');
}

function statusOptions(current) {
  return Object.keys(STATUS_LABELS)
    .map((status) => `<option value="${status}" ${status === current ? 'selected' : ''}>${STATUS_LABELS[status]}</option>`)
    .join('');
}

function renderRow(request) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${request.employee_name}</td>
    <td>${request.department_name}</td>
    <td>${request.manager_name || '-'}</td>
    <td>${request.leave_type_name}</td>
    <td>${formatDate(request.start_date)}</td>
    <td>${formatDate(request.end_date)}</td>
    <td><span class="status-badge status-${request.status}">${STATUS_LABELS[request.status]}</span></td>
    <td>${request.report_file ? `<a href="/api/leave-requests/${request.id}/report" target="_blank" class="report-badge">Raporu Görüntüle</a>` : '-'}</td>
    <td>
      <div class="quick-actions">
        <a href="/admin/leave-requests/edit?id=${request.id}" class="btn-edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>Duzenle</a>
        <select data-id="${request.id}" class="status-select">${statusOptions(request.status)}</select>
      </div>
    </td>
  `;
  return tr;
}

async function loadRequests() {
  try {
    const query = buildFilterQuery();
    const res = await fetch(`/api/admin/leave-requests${query ? `?${query}` : ''}`);
    if (!res.ok) {
      const data = await res.json();
      messageEl.textContent = data.message || 'Talepler yuklenemedi';
      messageEl.className = 'form-message error';
      return;
    }
    const data = await res.json();
    tbody.innerHTML = '';

    if (data.requests.length === 0) {
      messageEl.textContent = 'Kriterlere uyan izin talebi bulunamadi.';
      messageEl.className = 'form-message';
      return;
    }

    messageEl.textContent = '';
    data.requests.forEach((request) => {
      tbody.appendChild(renderRow(request));
    });
  } catch (err) {
    messageEl.textContent = 'Talepler yuklenirken bir hata olustu';
    messageEl.className = 'form-message error';
  }
}

tbody.addEventListener('change', async (event) => {
  if (!event.target.classList.contains('status-select')) return;

  const id = event.target.getAttribute('data-id');
  const status = event.target.value;

  const confirmed = await confirmStatusChange(STATUS_LABELS[status]);
  if (!confirmed) {
    loadRequests();
    return;
  }

  try {
    const res = await fetch(`/api/admin/leave-requests/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) {
      messageEl.textContent = data.message || 'Islem basarisiz';
      messageEl.className = 'form-message error';
      loadRequests();
      return;
    }
    loadRequests();
  } catch (err) {
    messageEl.textContent = 'Sunucuya baglanilamadi';
    messageEl.className = 'form-message error';
  }
});

const debouncedLoadRequests = debounce(loadRequests, 300);

filterSearch.addEventListener('input', debouncedLoadRequests);
[filterDepartment, filterStatus, filterLeaveType, filterDateFrom, filterDateTo].forEach((field) => {
  field.addEventListener('change', loadRequests);
});

filterClear.addEventListener('click', () => {
  filterSearch.value = '';
  filterDepartment.value = '';
  filterStatus.value = '';
  filterLeaveType.value = '';
  filterDateFrom.value = '';
  filterDateTo.value = '';
  loadRequests();
});

loadFilterOptions().then(loadRequests);
