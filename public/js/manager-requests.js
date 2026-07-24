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

function buildFilterQuery() {
  const params = new URLSearchParams();
  if (filterSearch.value.trim()) params.set('search', filterSearch.value.trim());
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

function countDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.round((end - start) / 86400000) + 1;
}

function renderRow(request) {
  const tr = document.createElement('tr');

  const actions = [];
  if (request.status === 'pending') {
    actions.push(
      `<button data-decision="approved" data-id="${request.id}" class="btn-approve"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>Onayla</button>`
    );
    actions.push(
      `<button data-decision="rejected" data-id="${request.id}" class="btn-reject"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>Reddet</button>`
    );
  }

  const startCell = request.start_time
    ? `${formatDate(request.start_date)} <span class="hour-range">${request.start_time.slice(0, 5)}</span>`
    : formatDate(request.start_date);
  const endCell = request.end_time
    ? `${formatDate(request.end_date)} <span class="hour-range">${request.end_time.slice(0, 5)}</span>`
    : formatDate(request.end_date);

  tr.innerHTML = `
    <td class="col-checkbox">
      <input type="checkbox" class="row-checkbox" data-id="${request.id}" ${selectedIds.has(request.id) ? 'checked' : ''} />
    </td>
    <td>${request.employee_name}</td>
    <td>${request.leave_type_name}</td>
    <td>${startCell}</td>
    <td>${endCell}</td>
    <td>${request.reason || '-'}</td>
    <td><span class="status-badge status-${request.status}">${STATUS_LABELS[request.status]}</span></td>
    <td>${request.report_file ? `<a href="/api/leave-requests/${request.id}/report" target="_blank" class="report-badge">Rapor</a>` : '-'}</td>
    <td><a href="/api/leave-requests/${request.id}/pdf" class="report-badge">PDF İndir</a></td>
    <td>${actions.length ? `<div class="quick-actions">${actions.join('')}</div>` : '-'}</td>
    <td>${request.leave_balance ? `${request.leave_balance.remainingDays}/${request.leave_balance.entitledDays}` : '-'}</td>
  `;
  return tr;
}

async function loadRequests() {
  try {
    const query = buildFilterQuery();
    const res = await fetch(`/api/manager/leave-requests${query ? `?${query}` : ''}`);
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

function loadRequestsFromStart() {
  currentPage = 1;
  loadRequests();
}

const debouncedLoadRequests = debounce(loadRequestsFromStart, 300);

filterSearch.addEventListener('input', debouncedLoadRequests);
[filterStatus, filterLeaveType, filterDateFrom, filterDateTo].forEach((field) => {
  field.addEventListener('change', loadRequestsFromStart);
});

filterClear.addEventListener('click', () => {
  filterSearch.value = '';
  filterStatus.value = '';
  filterLeaveType.value = '';
  filterDateFrom.value = '';
  filterDateTo.value = '';
  loadRequestsFromStart();
});

tbody.addEventListener('click', async (event) => {
  const target = event.target.closest('[data-decision]');
  if (!target) return;
  const id = target.getAttribute('data-id');
  const decision = target.getAttribute('data-decision');

  let approval_note = '';
  if (decision === 'approved') {
    const confirmed = await confirmApproveRequest();
    if (!confirmed) return;
  } else {
    const result = await confirmRejectRequest();
    if (!result) return;
    approval_note = result.note;
  }

  try {
    const res = await fetch(`/api/manager/leave-requests/${id}/decision`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, approval_note }),
    });
    const data = await res.json();
    if (!res.ok) {
      messageEl.textContent = data.message || 'Islem basarisiz';
      messageEl.className = 'form-message error';
      return;
    }
    loadRequests();
  } catch (err) {
    messageEl.textContent = 'Sunucuya baglanilamadi';
    messageEl.className = 'form-message error';
  }
});

tbody.addEventListener('change', (event) => {
  if (!event.target.classList.contains('row-checkbox')) return;
  const id = Number(event.target.getAttribute('data-id'));
  if (event.target.checked) {
    selectedIds.add(id);
  } else {
    selectedIds.delete(id);
  }
  updateBulkActionBar();
});

/* ---------- Toplu islem ---------- */

function updateBulkActionBar() {
  const checkboxes = Array.from(tbody.querySelectorAll('.row-checkbox'));
  const selected = Array.from(selectedIds)
    .map((id) => requestsById.get(id))
    .filter(Boolean);

  bulkActionBar.hidden = selected.length === 0;
  bulkSelectedCountEl.textContent = selected.length;
  bulkTotalDaysEl.textContent = selected.reduce((sum, r) => sum + countDays(r.start_date, r.end_date), 0);
  bulkTotalPeopleEl.textContent = new Set(selected.map((r) => r.employee_name)).size;

  if (checkboxes.length === 0) {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = false;
  } else {
    const allChecked = checkboxes.every((cb) => cb.checked);
    const someChecked = checkboxes.some((cb) => cb.checked);
    selectAllCheckbox.checked = allChecked;
    selectAllCheckbox.indeterminate = someChecked && !allChecked;
  }
}

selectAllCheckbox.addEventListener('change', () => {
  const checkboxes = Array.from(tbody.querySelectorAll('.row-checkbox'));
  checkboxes.forEach((cb) => {
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

async function performBulkDecision(decision, approval_note) {
  const ids = Array.from(selectedIds);
  try {
    const res = await fetch('/api/manager/leave-requests/bulk-decision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, decision, approval_note }),
    });
    const data = await res.json();
    if (!res.ok) {
      showActionToast(data.message || 'Islem basarisiz', 'error');
      return;
    }
    const verb = decision === 'approved' ? 'onaylandi' : 'reddedildi';
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
  performBulkDecision('approved');
});

bulkRejectBtn.addEventListener('click', async () => {
  if (!selectedIds.size) return;
  const result = await confirmBulkReject(selectedIds.size);
  if (!result) return;
  performBulkDecision('rejected', result.note);
});

function getSelectedRequestsList() {
  return Array.from(selectedIds)
    .map((id) => requestsById.get(id))
    .filter(Boolean);
}

bulkPdfBtn.addEventListener('click', () => {
  const selected = getSelectedRequestsList();
  if (!selected.length) return;

  const headers = ['Personel', 'Izin Turu', 'Baslangic', 'Bitis', 'Durum'];
  const rows = selected.map((r) => [
    r.employee_name,
    r.leave_type_name,
    formatDate(r.start_date),
    formatDate(r.end_date),
    STATUS_LABELS[r.status],
  ]);

  exportReportToPDF({
    filename: `secili-ekip-talepleri-${new Date().toISOString().slice(0, 10)}.pdf`,
    title: 'Secili Ekip Izin Talepleri',
    subtitle: `Olusturulma: ${new Date().toLocaleString('tr-TR')}`,
    headers,
    rows,
  });
});

bulkCsvBtn.addEventListener('click', () => {
  const selected = getSelectedRequestsList();
  if (!selected.length) return;

  const headers = ['Personel', 'Izin Turu', 'Baslangic', 'Bitis', 'Durum'];
  const rows = selected.map((r) => [
    r.employee_name,
    r.leave_type_name,
    formatDate(r.start_date),
    formatDate(r.end_date),
    STATUS_LABELS[r.status],
  ]);

  exportReportToCSV({
    filename: `secili-ekip-talepleri-${new Date().toISOString().slice(0, 10)}.csv`,
    headers,
    rows,
  });
});

loadLeaveTypeOptions().then(loadRequests);
