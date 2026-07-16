const STATUS_LABELS = {
  pending: 'Bekliyor',
  approved: 'Onaylandi',
  rejected: 'Reddedildi',
  cancelled: 'Iptal Edildi',
};

const PAGE_SIZE = 20;

const tbody = document.getElementById('requests-body');
const messageEl = document.getElementById('list-message');
const filterSearch = document.getElementById('filter-search');
const filterDepartment = document.getElementById('filter-department');
const filterStatus = document.getElementById('filter-status');
const filterLeaveType = document.getElementById('filter-leave-type');
const filterDateFrom = document.getElementById('filter-date-from');
const filterDateTo = document.getElementById('filter-date-to');
const filterClear = document.getElementById('filter-clear');
const paginationEl = document.getElementById('pagination');
const selectAllCheckbox = document.getElementById('select-all-checkbox');
const bulkActionBar = document.getElementById('bulk-action-bar');
const bulkSelectedCountEl = document.getElementById('bulk-selected-count');
const bulkTotalDaysEl = document.getElementById('bulk-total-days');
const bulkTotalPeopleEl = document.getElementById('bulk-total-people');
const bulkApproveBtn = document.getElementById('bulk-approve-btn');
const bulkRejectBtn = document.getElementById('bulk-reject-btn');
const bulkPdfBtn = document.getElementById('bulk-pdf-btn');
const bulkCsvBtn = document.getElementById('bulk-csv-btn');
const bulkClearBtn = document.getElementById('bulk-clear-btn');

let currentPage = 1;
let requestsById = new Map();
const selectedIds = new Set();

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
  params.set('page', currentPage);
  params.set('limit', PAGE_SIZE);
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

function countDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.round((end - start) / 86400000) + 1;
}

function renderRow(request) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td class="col-checkbox">
      <input type="checkbox" class="row-checkbox" data-id="${request.id}" ${selectedIds.has(request.id) ? 'checked' : ''} />
    </td>
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
    selectedIds.clear();
    requestsById = new Map(data.requests.map((request) => [request.id, request]));

    if (data.requests.length === 0) {
      messageEl.textContent = 'Kriterlere uyan izin talebi bulunamadi.';
      messageEl.className = 'form-message';
    } else {
      messageEl.textContent = '';
      data.requests.forEach((request) => {
        tbody.appendChild(renderRow(request));
      });
    }

    updateBulkActionBar();

    if (data.pagination) {
      renderPagination(paginationEl, {
        page: data.pagination.page,
        totalPages: data.pagination.totalPages,
        onChange: (page) => {
          currentPage = page;
          loadRequests();
        },
      });
    }
  } catch (err) {
    messageEl.textContent = 'Talepler yuklenirken bir hata olustu';
    messageEl.className = 'form-message error';
  }
}

tbody.addEventListener('change', async (event) => {
  if (event.target.classList.contains('row-checkbox')) {
    const id = Number(event.target.getAttribute('data-id'));
    if (event.target.checked) {
      selectedIds.add(id);
    } else {
      selectedIds.delete(id);
    }
    updateBulkActionBar();
    return;
  }

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

function loadRequestsFromStart() {
  currentPage = 1;
  loadRequests();
}

const debouncedLoadRequests = debounce(loadRequestsFromStart, 300);

filterSearch.addEventListener('input', debouncedLoadRequests);
[filterDepartment, filterStatus, filterLeaveType, filterDateFrom, filterDateTo].forEach((field) => {
  field.addEventListener('change', loadRequestsFromStart);
});

filterClear.addEventListener('click', () => {
  filterSearch.value = '';
  filterDepartment.value = '';
  filterStatus.value = '';
  filterLeaveType.value = '';
  filterDateFrom.value = '';
  filterDateTo.value = '';
  loadRequestsFromStart();
});

/* ---------- Toplu islem ---------- */

function updateBulkActionBar() {
  const pendingCheckboxes = Array.from(tbody.querySelectorAll('.row-checkbox'));
  const selected = Array.from(selectedIds)
    .map((id) => requestsById.get(id))
    .filter(Boolean);

  bulkActionBar.hidden = selected.length === 0;
  bulkSelectedCountEl.textContent = selected.length;
  bulkTotalDaysEl.textContent = selected.reduce((sum, r) => sum + countDays(r.start_date, r.end_date), 0);
  bulkTotalPeopleEl.textContent = new Set(selected.map((r) => r.employee_name)).size;

  if (pendingCheckboxes.length === 0) {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = false;
  } else {
    const allChecked = pendingCheckboxes.every((cb) => cb.checked);
    const someChecked = pendingCheckboxes.some((cb) => cb.checked);
    selectAllCheckbox.checked = allChecked;
    selectAllCheckbox.indeterminate = someChecked && !allChecked;
  }
}

selectAllCheckbox.addEventListener('change', () => {
  const pendingCheckboxes = Array.from(tbody.querySelectorAll('.row-checkbox'));
  pendingCheckboxes.forEach((cb) => {
    cb.checked = selectAllCheckbox.checked;
    const id = Number(cb.getAttribute('data-id'));
    if (selectAllCheckbox.checked) {
      selectedIds.add(id);
    } else {
      selectedIds.delete(id);
    }
  });
  updateBulkActionBar();
});

bulkClearBtn.addEventListener('click', () => {
  selectedIds.clear();
  tbody.querySelectorAll('.row-checkbox').forEach((cb) => {
    cb.checked = false;
  });
  updateBulkActionBar();
});

async function performBulkStatusUpdate(status, approval_note) {
  const ids = Array.from(selectedIds);
  try {
    const res = await fetch('/api/admin/leave-requests/bulk-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, status, approval_note }),
    });
    const data = await res.json();
    if (!res.ok) {
      showActionToast(data.message || 'Islem basarisiz', 'error');
      return;
    }
    const verb = status === 'approved' ? 'onaylandi' : 'reddedildi';
    const skippedNote = data.skippedCount
      ? ` (${data.skippedCount} kayit zaten karara baglandigi icin atlandi)`
      : '';
    showActionToast(`${data.updatedCount} izin talebi basariyla ${verb}.${skippedNote}`, data.updatedCount ? 'success' : 'info');
    loadRequests();
  } catch (err) {
    showActionToast('Sunucuya baglanilamadi', 'error');
  }
}

bulkApproveBtn.addEventListener('click', async () => {
  if (!selectedIds.size) return;
  const confirmed = await confirmBulkApprove(selectedIds.size);
  if (!confirmed) return;
  performBulkStatusUpdate('approved');
});

bulkRejectBtn.addEventListener('click', async () => {
  if (!selectedIds.size) return;
  const result = await confirmBulkReject(selectedIds.size);
  if (!result) return;
  performBulkStatusUpdate('rejected', result.note);
});

function getSelectedRequestsSorted() {
  return Array.from(selectedIds)
    .map((id) => requestsById.get(id))
    .filter(Boolean);
}

bulkPdfBtn.addEventListener('click', () => {
  const selected = getSelectedRequestsSorted();
  if (!selected.length) return;

  const headers = ['Personel', 'Departman', 'Yonetici', 'Izin Turu', 'Baslangic', 'Bitis', 'Durum'];
  const rows = selected.map((r) => [
    r.employee_name,
    r.department_name,
    r.manager_name || '-',
    r.leave_type_name,
    formatDate(r.start_date),
    formatDate(r.end_date),
    STATUS_LABELS[r.status],
  ]);

  exportReportToPDF({
    filename: `secili-izin-talepleri-${new Date().toISOString().slice(0, 10)}.pdf`,
    title: 'Secili Izin Talepleri',
    subtitle: `Olusturulma: ${new Date().toLocaleString('tr-TR')}`,
    headers,
    rows,
  });
});

bulkCsvBtn.addEventListener('click', () => {
  const selected = getSelectedRequestsSorted();
  if (!selected.length) return;

  const headers = ['Personel', 'Departman', 'Yonetici', 'Izin Turu', 'Baslangic', 'Bitis', 'Durum'];
  const rows = selected.map((r) => [
    r.employee_name,
    r.department_name,
    r.manager_name || '-',
    r.leave_type_name,
    formatDate(r.start_date),
    formatDate(r.end_date),
    STATUS_LABELS[r.status],
  ]);

  exportReportToCSV({
    filename: `secili-izin-talepleri-${new Date().toISOString().slice(0, 10)}.csv`,
    headers,
    rows,
  });
});

loadFilterOptions().then(loadRequests);
