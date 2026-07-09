const form = document.getElementById('user-form');
const messageEl = document.getElementById('form-message');
const roleSelect = document.getElementById('role_id');
const departmentSelect = document.getElementById('department_id');
const managerSelect = document.getElementById('manager_id');
const passwordInput = document.getElementById('password');
const passwordLabel = document.getElementById('password-label');
const activeField = document.getElementById('active-field');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');

const userId = new URLSearchParams(window.location.search).get('id');
const isEditMode = window.location.pathname === '/admin/users/edit' && userId;

if (isEditMode) {
  formTitle.textContent = 'Kullaniciyi Duzenle';
  submitBtn.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>Degisiklikleri Kaydet';
  passwordLabel.textContent = 'Sifre (degistirmek icin doldurun)';
  activeField.hidden = false;
} else {
  passwordInput.required = true;
}

async function loadOptions(url, select, labelKey) {
  const res = await fetch(url);
  const data = await res.json();
  const key = Object.keys(data)[0];
  data[key].forEach((item) => {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = item[labelKey];
    select.appendChild(option);
  });
}

async function loadExistingUser() {
  const res = await fetch(`/api/admin/users/${userId}`);
  const data = await res.json();

  if (!res.ok) {
    messageEl.textContent = data.message || 'Kullanici bulunamadi';
    messageEl.className = 'form-message error';
    form.querySelector('button').disabled = true;
    return;
  }

  document.getElementById('full_name').value = data.user.full_name;
  document.getElementById('email').value = data.user.email;
  roleSelect.value = data.user.role_id;
  departmentSelect.value = data.user.department_id;
  managerSelect.value = data.user.manager_id || '';
  document.getElementById('is_active').value = data.user.is_active ? 'true' : 'false';
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  messageEl.textContent = '';
  messageEl.className = 'form-message';

  const payload = {
    full_name: document.getElementById('full_name').value,
    email: document.getElementById('email').value,
    role_id: roleSelect.value,
    department_id: departmentSelect.value,
    manager_id: managerSelect.value,
  };

  if (passwordInput.value) {
    payload.password = passwordInput.value;
  }

  if (isEditMode) {
    payload.is_active = document.getElementById('is_active').value === 'true';
  }

  const url = isEditMode ? `/api/admin/users/${userId}` : '/api/admin/users';
  const method = isEditMode ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
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

    window.location.href = '/admin/users';
  } catch (err) {
    messageEl.textContent = 'Sunucuya baglanilamadi';
    messageEl.classList.add('error');
  }
});

Promise.all([
  loadOptions('/api/roles', roleSelect, 'name'),
  loadOptions('/api/departments', departmentSelect, 'name'),
  loadOptions('/api/managers', managerSelect, 'full_name'),
]).then(() => {
  if (isEditMode) {
    loadExistingUser();
  }
});
