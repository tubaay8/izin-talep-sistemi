const STATUS_LABELS = {
  pending: 'Bekliyor',
  approved: 'Onaylandi',
  rejected: 'Reddedildi',
  cancelled: 'Iptal Edildi',
};

const REPORT_PAGE_SIZE = 20;

const tbody = document.getElementById('report-body');
const messageEl = document.getElementById('list-message');
const paginationEl = document.getElementById('pagination');
const filterStatus = document.getElementById('filter-status');
const filterLeaveType = document.getElementById('filter-leave-type');
const filterDateFrom = document.getElementById('filter-date-from');
const filterDateTo = document.getElementById('filter-date-to');
const filterClear = document.getElementById('filter-clear');

let currentUser = null;
let currentRequests = [];
let currentPage = 1;

function formatDate(value) {
  return new Date(value).toLocaleDateString('tr-TR');
}

function buildFilterQuery() {
  const params = new URLSearchParams();
  if (filterStatus.value) params.set('status', filterStatus.value);
  if (filterLeaveType.value) params.set('leave_type_id', filterLeaveType.value);
  if (filterDateFrom.value) params.set('date_from', filterDateFrom.value);
  if (filterDateTo.value) params.set('date_to', filterDateTo.value);
  return params.toString();
}

function renderRow(request) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${request.leave_type_name}</td>
    <td>${formatDate(request.start_date)}</td>
    <td>${formatDate(request.end_date)}</td>
    <td>${request.reason || '-'}</td>
    <td><span class="status-badge status-${request.status}">${STATUS_LABELS[request.status]}</span></td>
    <td class="no-print"><a href="/api/leave-requests/${request.id}/pdf" class="report-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h9l3 3v15H6z"/><path d="M12 10v6M9.5 13.5L12 16l2.5-2.5"/></svg>PDF Formu Indir</a></td>
  `;
  return tr;
}

async function loadLeaveTypeOptions() {
  const res = await fetch('/api/leave-types');
  const data = await res.json();
  data.leaveTypes.forEach((type) => {
    const option = document.createElement('option');
    option.value = type.id;
    option.textContent = type.name;
    filterLeaveType.appendChild(option);
  });
}

function renderTablePage() {
  tbody.innerHTML = '';

  if (currentRequests.length === 0) {
    messageEl.textContent = 'Kriterlere uyan izin talebi bulunamadi.';
    messageEl.className = 'form-message';
  } else {
    messageEl.textContent = '';
    const start = (currentPage - 1) * REPORT_PAGE_SIZE;
    currentRequests.slice(start, start + REPORT_PAGE_SIZE).forEach((request) => {
      tbody.appendChild(renderRow(request));
    });
  }

  const totalPages = Math.max(1, Math.ceil(currentRequests.length / REPORT_PAGE_SIZE));
  renderPagination(paginationEl, {
    page: currentPage,
    totalPages,
    onChange: (page) => {
      currentPage = page;
      renderTablePage();
    },
  });
}

async function loadReport() {
  try {
    const query = buildFilterQuery();
    const res = await fetch(`/api/leave-requests${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Rapor yuklenemedi');

    const data = await res.json();
    currentRequests = data.requests;
    currentPage = 1;
    renderTablePage();
  } catch (err) {
    messageEl.textContent = 'Rapor yuklenirken bir hata olustu';
    messageEl.className = 'form-message error';
  }
}

function reportHeaders() {
  return ['Izin Turu', 'Baslangic', 'Bitis', 'Aciklama', 'Durum'];
}

function reportRows() {
  return currentRequests.map((r) => [
    r.leave_type_name,
    formatDate(r.start_date),
    formatDate(r.end_date),
    r.reason || '-',
    STATUS_LABELS[r.status],
  ]);
}

[filterStatus, filterLeaveType, filterDateFrom, filterDateTo].forEach((field) => {
  field.addEventListener('change', loadReport);
});

filterClear.addEventListener('click', () => {
  filterStatus.value = '';
  filterLeaveType.value = '';
  filterDateFrom.value = '';
  filterDateTo.value = '';
  loadReport();
});

document.getElementById('btn-print').addEventListener('click', printReport);

document.getElementById('btn-pdf').addEventListener('click', () => {
  exportReportToPDF({
    filename: 'izin-raporum.pdf',
    title: 'Izin Raporum',
    subtitle: `${currentUser ? currentUser.full_name : ''} - ${new Date().toLocaleString('tr-TR')}`,
    headers: reportHeaders(),
    rows: reportRows(),
  });
});

document.getElementById('btn-csv').addEventListener('click', () => {
  exportReportToCSV({
    filename: 'izin-raporum.csv',
    headers: reportHeaders(),
    rows: reportRows(),
  });
});

async function init() {
  const meRes = await fetch('/api/auth/me');
  if (meRes.ok) {
    const data = await meRes.json();
    currentUser = data.user;
  }
  await loadLeaveTypeOptions();
  await loadReport();
}

init();
