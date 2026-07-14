const form = document.getElementById('user-form');
const messageEl = document.getElementById('form-message');
const roleSelect = document.getElementById('role_id');
const departmentSelect = document.getElementById('department_id');
const managerSelect = document.getElementById('manager_id');
const departmentHint = document.getElementById('department-hint');
const managerHint = document.getElementById('manager-hint');
const passwordField = document.getElementById('password-field');
const passwordInput = document.getElementById('password');
const passwordLabel = document.getElementById('password-label');
const passwordHint = document.getElementById('password-hint');
const activeField = document.getElementById('active-field');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');

const HR_DEPARTMENT_NAME = 'Insan Kaynaklari';
let departmentsData = [];
let hrDepartmentId = null;

function getSelectedRoleName() {
  const opt = roleSelect.options[roleSelect.selectedIndex];
  return opt ? opt.textContent : '';
}

function applyDepartmentManagerHint() {
  const dept = departmentsData.find((d) => String(d.id) === String(departmentSelect.value));
  if (dept && dept.manager_id) {
    managerSelect.value = dept.manager_id;
    managerHint.textContent = `Bu departmanin yoneticisi: ${dept.manager_name}`;
  } else {
    managerSelect.value = '';
    managerHint.textContent = dept ? 'Bu departmanin henuz yoneticisi yok, once departmana bir yonetici atayin.' : '';
  }
}

function applyRoleConstraints() {
  const roleName = getSelectedRoleName();

  if (roleName === 'Yonetici') {
    if (hrDepartmentId) departmentSelect.value = hrDepartmentId;
    departmentSelect.disabled = true;
    departmentHint.textContent = 'Yoneticiler organizasyonel olarak Insan Kaynaklari departmaninda gorunur.';
    managerSelect.disabled = false;
    managerHint.textContent = '';
  } else if (roleName === 'Personel') {
    departmentSelect.disabled = false;
    departmentHint.textContent = '';
    managerSelect.disabled = true;
    applyDepartmentManagerHint();
  } else {
    departmentSelect.disabled = false;
    departmentHint.textContent = '';
    managerSelect.disabled = false;
    managerHint.textContent = '';
  }
}

const userId = new URLSearchParams(window.location.search).get('id');
const isEditMode = window.location.pathname === '/admin/users/edit' && userId;

if (isEditMode) {
  formTitle.textContent = 'Kullaniciyi Duzenle';
  submitBtn.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>Degisiklikleri Kaydet';
  passwordLabel.textContent = 'Sifre (degistirmek icin doldurun)';
  passwordField.hidden = false;
  passwordHint.hidden = true;
  activeField.hidden = false;
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

async function loadDepartments() {
  const res = await fetch('/api/departments');
  const data = await res.json();
  departmentsData = data.departments;
  departmentsData.forEach((dept) => {
    const option = document.createElement('option');
    option.value = dept.id;
    option.textContent = dept.name;
    departmentSelect.appendChild(option);
  });
  const hrDepartment = departmentsData.find((d) => d.name === HR_DEPARTMENT_NAME);
  hrDepartmentId = hrDepartment ? hrDepartment.id : null;
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
  applyRoleConstraints();
}

roleSelect.addEventListener('change', applyRoleConstraints);
departmentSelect.addEventListener('change', () => {
  if (getSelectedRoleName() === 'Personel') applyDepartmentManagerHint();
});

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

    if (!isEditMode && data.user && data.user.temporaryPassword) {
      await showTemporaryPasswordDialog(data.user.full_name, data.user.temporaryPassword);
    }

    window.location.href = '/admin/users';
  } catch (err) {
    messageEl.textContent = 'Sunucuya baglanilamadi';
    messageEl.classList.add('error');
  }
});

Promise.all([
  loadOptions('/api/roles', roleSelect, 'name'),
  loadDepartments(),
  loadOptions('/api/managers', managerSelect, 'full_name'),
]).then(() => {
  if (isEditMode) {
    loadExistingUser();
  } else {
    applyRoleConstraints();
  }
});
