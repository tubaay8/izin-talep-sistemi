const STATUS_LABELS = {
  pending: 'Bekliyor',
  approved: 'Onaylandi',
  rejected: 'Reddedildi',
  cancelled: 'Iptal Edildi',
};

const tbody = document.getElementById('requests-body');
const messageEl = document.getElementById('list-message');
const filterSearch = document.getElementById('filter-search');
const filterStatus = document.getElementById('filter-status');
const filterLeaveType = document.getElementById('filter-leave-type');
const filterDateFrom = document.getElementById('filter-date-from');
const filterDateTo = document.getElementById('filter-date-to');
const filterClear = document.getElementById('filter-clear');

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

function renderRow(request) {
  const tr = document.createElement('tr');

  const actions = [];
  if (request.status === 'pending') {
    actions.push(
      `<button data-decision="approved" data-id="${request.id}" class="link-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>Onayla</button>`
    );
    actions.push(
      `<button data-decision="rejected" data-id="${request.id}" class="link-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>Reddet</button>`
    );
  }

  tr.innerHTML = `
    <td>${request.employee_name}</td>
    <td>${request.leave_type_name}</td>
    <td>${formatDate(request.start_date)}</td>
    <td>${formatDate(request.end_date)}</td>
    <td>${request.reason || '-'}</td>
    <td><span class="status-badge status-${request.status}">${STATUS_LABELS[request.status]}</span></td>
    <td>${actions.join(' | ') || '-'}</td>
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

const debouncedLoadRequests = debounce(loadRequests, 300);

filterSearch.addEventListener('input', debouncedLoadRequests);
[filterStatus, filterLeaveType, filterDateFrom, filterDateTo].forEach((field) => {
  field.addEventListener('change', loadRequests);
});

filterClear.addEventListener('click', () => {
  filterSearch.value = '';
  filterStatus.value = '';
  filterLeaveType.value = '';
  filterDateFrom.value = '';
  filterDateTo.value = '';
  loadRequests();
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

loadLeaveTypeOptions().then(loadRequests);
