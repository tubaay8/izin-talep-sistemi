const form = document.getElementById('leave-request-form');
const messageEl = document.getElementById('form-message');
const leaveTypeSelect = document.getElementById('leave_type_id');
const employeeInfo = document.getElementById('employee-info');
const reportUploadGroup = document.getElementById('report-upload-group');
const reportFileInput = document.getElementById('report_file');
const reportFileNameEl = document.getElementById('report-file-name');
const reportExistingFileEl = document.getElementById('report-existing-file');
const timeRangeGroup = document.getElementById('time-range-group');
const timeRangeTotalEl = document.getElementById('time-range-total');
const startDateInput = document.getElementById('start_date');
const endDateInput = document.getElementById('end_date');
const startTimeInput = document.getElementById('start_time');
const endTimeInput = document.getElementById('end_time');

const requestId = new URLSearchParams(window.location.search).get('id');

let leaveTypes = [];

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

function getSelectedLeaveType() {
  return leaveTypes.find((type) => String(type.id) === leaveTypeSelect.value);
}

function isHourlyLeaveSelected() {
  const type = getSelectedLeaveType();
  return Boolean(type && type.is_hourly);
}

function updateTimeRangeTotal() {
  if (!startTimeInput.value || !endTimeInput.value) {
    timeRangeTotalEl.textContent = '';
    timeRangeTotalEl.classList.remove('error');
    return;
  }
  const [sh, sm] = startTimeInput.value.split(':').map(Number);
  const [eh, em] = endTimeInput.value.split(':').map(Number);
  const minutes = eh * 60 + em - (sh * 60 + sm);
  if (minutes <= 0) {
    timeRangeTotalEl.textContent = 'Bitis saati baslangic saatinden sonra olmalidir';
    timeRangeTotalEl.classList.add('error');
    return;
  }
  const hours = Math.round((minutes / 60) * 10) / 10;
  timeRangeTotalEl.textContent = `Toplam: ${hours} saat`;
  timeRangeTotalEl.classList.remove('error');
}

function updateTimeRangeVisibility() {
  const isHourly = isHourlyLeaveSelected();
  timeRangeGroup.hidden = !isHourly;
  startTimeInput.required = isHourly;
  endTimeInput.required = isHourly;
  endDateInput.readOnly = isHourly;
  if (isHourly && startDateInput.value) {
    endDateInput.value = startDateInput.value;
  }
  updateTimeRangeTotal();
}

leaveTypeSelect.addEventListener('change', updateReportFieldVisibility);
leaveTypeSelect.addEventListener('change', updateTimeRangeVisibility);
startTimeInput.addEventListener('change', updateTimeRangeTotal);
endTimeInput.addEventListener('change', updateTimeRangeTotal);
startDateInput.addEventListener('change', () => {
  if (isHourlyLeaveSelected()) endDateInput.value = startDateInput.value;
});

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
  leaveTypes = data.leaveTypes;
  leaveTypes.forEach((type) => {
    const option = document.createElement('option');
    option.value = type.id;
    option.textContent = type.name;
    leaveTypeSelect.appendChild(option);
  });
}

async function loadExistingRequest() {
  const res = await fetch(`/api/admin/leave-requests/${requestId}`);
  const data = await res.json();

  if (!res.ok) {
    messageEl.textContent = data.message || 'Talep bulunamadi';
    messageEl.className = 'form-message error';
    form.querySelector('button').disabled = true;
    return;
  }

  employeeInfo.textContent = `${data.request.employee_name} (${data.request.department_name})`;
  leaveTypeSelect.value = data.request.leave_type_id;
  startDateInput.value = data.request.start_date.slice(0, 10);
  endDateInput.value = data.request.end_date.slice(0, 10);
  document.getElementById('reason').value = data.request.reason || '';
  if (data.request.start_time) startTimeInput.value = data.request.start_time.slice(0, 5);
  if (data.request.end_time) endTimeInput.value = data.request.end_time.slice(0, 5);

  if (data.request.report_file) {
    reportExistingFileEl.innerHTML = `Mevcut rapor: <a href="/api/leave-requests/${requestId}/report" target="_blank">Raporu Görüntüle</a>`;
    reportExistingFileEl.hidden = false;
    reportExistingFileEl.dataset.hasFile = 'true';
  }

  updateReportFieldVisibility();
  updateTimeRangeVisibility();
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  messageEl.textContent = '';
  messageEl.className = 'form-message';

  const formData = new FormData();
  formData.append('leave_type_id', leaveTypeSelect.value);
  formData.append('start_date', startDateInput.value);
  formData.append('end_date', endDateInput.value);
  if (isHourlyLeaveSelected()) {
    formData.append('start_time', startTimeInput.value);
    formData.append('end_time', endTimeInput.value);
  }
  formData.append('reason', document.getElementById('reason').value);
  if (reportFileInput.files[0]) {
    formData.append('report_file', reportFileInput.files[0]);
  }

  try {
    const res = await fetch(`/api/admin/leave-requests/${requestId}`, {
      method: 'PUT',
      body: formData,
    });
    const data = await res.json();

    if (!res.ok) {
      const detail = data.errors ? data.errors.map((e) => e.msg).join(', ') : data.message;
      messageEl.textContent = detail || 'Islem basarisiz';
      messageEl.classList.add('error');
      return;
    }

    window.location.href = '/admin/leave-requests';
  } catch (err) {
    messageEl.textContent = 'Sunucuya baglanilamadi';
    messageEl.classList.add('error');
  }
});

if (!requestId) {
  window.location.href = '/admin/leave-requests';
} else {
  loadLeaveTypes().then(loadExistingRequest);
}
