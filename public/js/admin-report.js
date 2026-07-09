const STATUS_LABELS = {
  pending: 'Bekliyor',
  approved: 'Onaylandi',
  rejected: 'Reddedildi',
  cancelled: 'Iptal Edildi',
};

const tbody = document.getElementById('report-body');
const messageEl = document.getElementById('list-message');
const summaryEl = document.getElementById('report-summary');
const reportMetaEl = document.getElementById('report-meta');
const filterSearch = document.getElementById('filter-search');
const filterDepartment = document.getElementById('filter-department');
const filterStatus = document.getElementById('filter-status');
const filterLeaveType = document.getElementById('filter-leave-type');
const filterDateFrom = document.getElementById('filter-date-from');
const filterDateTo = document.getElementById('filter-date-to');
const filterClear = document.getElementById('filter-clear');

let currentUser = null;
let currentRequests = [];

function formatDate(value) {
  return new Date(value).toLocaleDateString('tr-TR');
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
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

function renderSummary(requests) {
  const counts = { pending: 0, approved: 0, rejected: 0, cancelled: 0 };
  requests.forEach((r) => {
    counts[r.status] = (counts[r.status] || 0) + 1;
  });

  summaryEl.innerHTML = `
    <span class="report-summary-item">Toplam: <strong>${requests.length}</strong></span>
    <span class="report-summary-item">Bekliyor: <strong>${counts.pending}</strong></span>
    <span class="report-summary-item">Onaylandi: <strong>${counts.approved}</strong></span>
    <span class="report-summary-item">Reddedildi: <strong>${counts.rejected}</strong></span>
    <span class="report-summary-item">Iptal Edildi: <strong>${counts.cancelled}</strong></span>
  `;
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
    <td class="no-print"><a href="/api/leave-requests/${request.id}/pdf" class="report-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h9l3 3v15H6z"/><path d="M12 10v6M9.5 13.5L12 16l2.5-2.5"/></svg>PDF Formu Indir</a></td>
  `;
  return tr;
}

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

async function loadReport() {
  try {
    const query = buildFilterQuery();
    const res = await fetch(`/api/admin/leave-requests${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Rapor yuklenemedi');

    const data = await res.json();
    currentRequests = data.requests;
    tbody.innerHTML = '';
    renderSummary(currentRequests);

    if (currentRequests.length === 0) {
      messageEl.textContent = 'Kriterlere uyan izin talebi bulunamadi.';
      messageEl.className = 'form-message';
    } else {
      messageEl.textContent = '';
      currentRequests.forEach((request) => {
        tbody.appendChild(renderRow(request));
      });
    }
  } catch (err) {
    messageEl.textContent = 'Rapor yuklenirken bir hata olustu';
    messageEl.className = 'form-message error';
  }
}

function reportHeaders() {
  return ['Personel', 'Departman', 'Yonetici', 'Izin Turu', 'Baslangic', 'Bitis', 'Durum'];
}

function reportRows() {
  return currentRequests.map((r) => [
    r.employee_name,
    r.department_name,
    r.manager_name || '-',
    r.leave_type_name,
    formatDate(r.start_date),
    formatDate(r.end_date),
    STATUS_LABELS[r.status],
  ]);
}

const debouncedLoadReport = debounce(loadReport, 300);
filterSearch.addEventListener('input', debouncedLoadReport);
[filterDepartment, filterStatus, filterLeaveType, filterDateFrom, filterDateTo].forEach((field) => {
  field.addEventListener('change', loadReport);
});

filterClear.addEventListener('click', () => {
  filterSearch.value = '';
  filterDepartment.value = '';
  filterStatus.value = '';
  filterLeaveType.value = '';
  filterDateFrom.value = '';
  filterDateTo.value = '';
  loadReport();
});

document.getElementById('btn-print').addEventListener('click', printReport);

document.getElementById('btn-pdf').addEventListener('click', () => {
  exportReportToPDF({
    filename: 'tum-izin-raporu.pdf',
    title: 'Tum Izin Talepleri Raporu',
    subtitle: `${currentUser ? currentUser.full_name : ''} - ${new Date().toLocaleString('tr-TR')}`,
    headers: reportHeaders(),
    rows: reportRows(),
  });
});

document.getElementById('btn-csv').addEventListener('click', () => {
  exportReportToCSV({
    filename: 'tum-izin-raporu.csv',
    headers: reportHeaders(),
    rows: reportRows(),
  });
});

async function init() {
  const meRes = await fetch('/api/auth/me');
  if (meRes.ok) {
    const data = await meRes.json();
    currentUser = data.user;
    reportMetaEl.textContent = `${currentUser.full_name} - Olusturulma: ${new Date().toLocaleString('tr-TR')}`;
  }
  await loadFilterOptions();
  await loadReport();
}

init();
