const form = document.getElementById('leave-request-form');
const messageEl = document.getElementById('form-message');
const leaveTypeSelect = document.getElementById('leave_type_id');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const reportUploadGroup = document.getElementById('report-upload-group');
const reportFileInput = document.getElementById('report_file');
const reportFileNameEl = document.getElementById('report-file-name');
const reportExistingFileEl = document.getElementById('report-existing-file');

const requestId = new URLSearchParams(window.location.search).get('id');
const isEditMode = window.location.pathname === '/leave-requests/edit' && requestId;

if (isEditMode) {
  formTitle.textContent = 'Izin Talebini Duzenle';
  submitBtn.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>Degisiklikleri Kaydet';
}

function isSickLeaveSelected() {
  const selectedOption = leaveTypeSelect.selectedOptions[0];
  if (!selectedOption) return false;
  return selectedOption.textContent.toLowerCase().includes('hastal');
}

function updateReportFieldVisibility() {
  const shouldShow = isSickLeaveSelected();
  reportUploadGroup.classList.toggle('visible', shouldShow);
  reportFileInput.required = shouldShow && !reportExistingFileEl.dataset.hasFile;
}

leaveTypeSelect.addEventListener('change', updateReportFieldVisibility);

reportFileInput.addEventListener('change', () => {
  reportFileNameEl.textContent = reportFileInput.files[0] ? reportFileInput.files[0].name : '';
  if (reportFileInput.files[0]) {
    reportFileInput.required = false;
    messageEl.textContent = '';
    messageEl.className = 'form-message';
  }
});

async function loadLeaveTypes() {
  const res = await fetch('/api/leave-types');
  const data = await res.json();
  data.leaveTypes.forEach((type) => {
    const option = document.createElement('option');
    option.value = type.id;
    option.textContent = type.name;
    leaveTypeSelect.appendChild(option);
  });
}

async function loadExistingRequest() {
  const res = await fetch(`/api/leave-requests/${requestId}`);
  const data = await res.json();

  if (!res.ok) {
    messageEl.textContent = data.message || 'Talep bulunamadi';
    messageEl.className = 'form-message error';
    form.querySelector('button').disabled = true;
    return;
  }

  if (data.request.status !== 'pending') {
    messageEl.textContent = 'Sadece bekleyen talepler duzenlenebilir';
    messageEl.className = 'form-message error';
    form.querySelector('button').disabled = true;
    return;
  }

  leaveTypeSelect.value = data.request.leave_type_id;
  document.getElementById('start_date').value = data.request.start_date.slice(0, 10);
  document.getElementById('end_date').value = data.request.end_date.slice(0, 10);
  document.getElementById('reason').value = data.request.reason || '';

  if (data.request.report_file) {
    reportExistingFileEl.innerHTML = `Mevcut rapor: <a href="/api/leave-requests/${requestId}/report" target="_blank">Raporu Görüntüle</a>`;
    reportExistingFileEl.hidden = false;
    reportExistingFileEl.dataset.hasFile = 'true';
  }

  updateReportFieldVisibility();
  checkDepartmentConflicts();
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  messageEl.textContent = '';
  messageEl.className = 'form-message';

  const formData = new FormData();
  formData.append('leave_type_id', leaveTypeSelect.value);
  formData.append('start_date', document.getElementById('start_date').value);
  formData.append('end_date', document.getElementById('end_date').value);
  formData.append('reason', document.getElementById('reason').value);
  if (reportFileInput.files[0]) {
    formData.append('report_file', reportFileInput.files[0]);
  }

  const url = isEditMode ? `/api/leave-requests/${requestId}` : '/api/leave-requests';
  const method = isEditMode ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, { method, body: formData });
    const data = await res.json();

    if (!res.ok) {
      const detail = data.errors ? data.errors.map((e) => e.msg).join(', ') : data.message;
      messageEl.textContent = detail || 'Islem basarisiz';
      messageEl.classList.add('error');
      return;
    }

    window.location.href = '/leave-requests';
  } catch (err) {
    messageEl.textContent = 'Sunucuya baglanilamadi';
    messageEl.classList.add('error');
  }
});

loadLeaveTypes().then(() => {
  if (isEditMode) {
    loadExistingRequest();
  } else {
    updateReportFieldVisibility();
  }
});

/* ---------- Departman cakisma analizi ---------- */

const startDateInput = document.getElementById('start_date');
const endDateInput = document.getElementById('end_date');
const conflictCleanEl = document.getElementById('conflict-clean');
const conflictCleanTitleEl = document.getElementById('conflict-clean-title');
const conflictCleanTextEl = document.getElementById('conflict-clean-text');
const conflictWarningEl = document.getElementById('conflict-warning');
const conflictWarningTextEl = document.getElementById('conflict-warning-text');
const conflictPeopleEl = document.getElementById('conflict-people');
const conflictPersonListEl = document.getElementById('conflict-person-list');
const conflictSummaryCardEl = document.getElementById('conflict-summary-card');
const conflictSummaryValueEl = document.getElementById('conflict-summary-value');
const conflictTipEl = document.getElementById('conflict-tip');

function getInitials(fullName) {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function formatDateTR(value) {
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString('tr-TR');
}

function showConflictState(state) {
  conflictCleanEl.hidden = state === 'warning';
  conflictWarningEl.hidden = state !== 'warning';
  conflictPeopleEl.hidden = state !== 'warning';
  conflictSummaryCardEl.hidden = state !== 'warning';
  conflictTipEl.hidden = state !== 'warning';
}

function renderConflicts(data) {
  if (!data.conflicts.length) {
    conflictCleanTitleEl.textContent = 'Çakışma bulunamadı';
    conflictCleanTextEl.textContent = 'Bu tarih aralığında departmanda iş yükünü etkileyecek bir durum görünmüyor.';
    showConflictState('clean');
    return;
  }

  showConflictState('warning');
  conflictWarningTextEl.textContent = `Seçilen tarihlerde ${data.departmentName} departmanında ${data.conflicts.length} kişi daha izinli olacaktır.`;
  conflictSummaryValueEl.textContent = `${data.totalOnLeave} Personel`;

  conflictPersonListEl.innerHTML = data.conflicts
    .map((item) => {
      const statusLabel = item.status === 'approved' ? 'Onaylandı' : 'Bekliyor';
      return `
        <div class="conflict-person-card">
          <div class="conflict-person-top">
            <span class="conflict-person-avatar">${getInitials(item.employee_name)}</span>
            <div class="conflict-person-info">
              <div class="conflict-person-name">${item.employee_name}</div>
              <div class="conflict-person-type">${item.leave_type_name}</div>
            </div>
            <span class="status-badge status-${item.status}">${statusLabel}</span>
          </div>
          <div class="conflict-person-dates">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4M16 3v4"/></svg>
            ${formatDateTR(item.start_date.slice(0, 10))} - ${formatDateTR(item.end_date.slice(0, 10))}
          </div>
        </div>
      `;
    })
    .join('');
}

async function checkDepartmentConflicts() {
  const startDate = startDateInput.value;
  const endDate = endDateInput.value;

  if (!startDate || !endDate || endDate < startDate) {
    conflictCleanTitleEl.textContent = 'Tarih aralığı seçilmedi';
    conflictCleanTextEl.textContent = 'Başlangıç ve bitiş tarihi seçtiğinizde çakışma analizi burada görünecek.';
    showConflictState('clean');
    return;
  }

  try {
    const params = new URLSearchParams({ start_date: startDate, end_date: endDate });
    const res = await fetch(`/api/leave-requests/conflicts?${params}`);
    if (!res.ok) return;
    const data = await res.json();
    if (!data.departmentName) return;
    renderConflicts(data);
  } catch (err) {
    // sessiz basarisizlik: form gonderimini engellemeyecek ikincil bir panel
  }
}

showConflictState('clean');

startDateInput.addEventListener('change', checkDepartmentConflicts);
endDateInput.addEventListener('change', checkDepartmentConflicts);
