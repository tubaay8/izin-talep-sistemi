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
