const form = document.getElementById('leave-request-form');
const messageEl = document.getElementById('form-message');
const leaveTypeSelect = document.getElementById('leave_type_id');
const employeeInfo = document.getElementById('employee-info');

const requestId = new URLSearchParams(window.location.search).get('id');

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
  document.getElementById('start_date').value = data.request.start_date.slice(0, 10);
  document.getElementById('end_date').value = data.request.end_date.slice(0, 10);
  document.getElementById('reason').value = data.request.reason || '';
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  messageEl.textContent = '';
  messageEl.className = 'form-message';

  const payload = {
    leave_type_id: leaveTypeSelect.value,
    start_date: document.getElementById('start_date').value,
    end_date: document.getElementById('end_date').value,
    reason: document.getElementById('reason').value,
  };

  try {
    const res = await fetch(`/api/admin/leave-requests/${requestId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
