const STATUS_LABELS = {
  pending: 'Bekliyor',
  approved: 'Onaylandi',
  rejected: 'Reddedildi',
  cancelled: 'Iptal Edildi',
};

const tbody = document.getElementById('requests-body');
const messageEl = document.getElementById('list-message');
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
  if (filterStatus.value) params.set('status', filterStatus.value);
  if (filterLeaveType.value) params.set('leave_type_id', filterLeaveType.value);
  if (filterDateFrom.value) params.set('date_from', filterDateFrom.value);
  if (filterDateTo.value) params.set('date_to', filterDateTo.value);
  return params.toString();
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('tr-TR');
}

function renderRow(request) {
  const tr = document.createElement('tr');

  const actions = [];
  if (request.status === 'pending') {
    actions.push(
      `<a href="/leave-requests/edit?id=${request.id}" class="link-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>Duzenle</a>`
    );
    actions.push(
      `<button data-cancel-id="${request.id}" class="link-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M6.5 6.5l11 11"/></svg>Iptal Et</button>`
    );
  }

  tr.innerHTML = `
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
    const res = await fetch(`/api/leave-requests${query ? `?${query}` : ''}`);
    if (!res.ok) {
      throw new Error('Talepler yuklenemedi');
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

[filterStatus, filterLeaveType, filterDateFrom, filterDateTo].forEach((field) => {
  field.addEventListener('change', loadRequests);
});

filterClear.addEventListener('click', () => {
  filterStatus.value = '';
  filterLeaveType.value = '';
  filterDateFrom.value = '';
  filterDateTo.value = '';
  loadRequests();
});

tbody.addEventListener('click', async (event) => {
  const target = event.target.closest('[data-cancel-id]');
  if (!target) return;
  const id = target.getAttribute('data-cancel-id');

  const confirmed = await confirmCancelRequest();
  if (!confirmed) {
    return;
  }

  try {
    const res = await fetch(`/api/leave-requests/${id}/cancel`, { method: 'PATCH' });
    const data = await res.json();
    if (!res.ok) {
      messageEl.textContent = data.message || 'Iptal islemi basarisiz';
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
