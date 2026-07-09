const form = document.getElementById('register-form');
const messageEl = document.getElementById('form-message');
const departmentSelect = document.getElementById('department_id');
const managerSelect = document.getElementById('manager_id');

async function loadDepartments() {
  try {
    const res = await fetch('/api/departments');
    const data = await res.json();
    data.departments.forEach((dept) => {
      const option = document.createElement('option');
      option.value = dept.id;
      option.textContent = dept.name;
      departmentSelect.appendChild(option);
    });
  } catch (err) {
    messageEl.textContent = 'Departmanlar yuklenemedi';
    messageEl.classList.add('error');
  }
}

async function loadManagers() {
  try {
    const res = await fetch('/api/managers');
    const data = await res.json();
    data.managers.forEach((manager) => {
      const option = document.createElement('option');
      option.value = manager.id;
      option.textContent = manager.full_name;
      managerSelect.appendChild(option);
    });
  } catch (err) {
    // Yonetici listesi opsiyonel, sessizce yoksayilabilir.
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  messageEl.textContent = '';
  messageEl.className = 'form-message';

  const full_name = document.getElementById('full_name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('password_confirm').value;
  const department_id = departmentSelect.value;
  const manager_id = managerSelect.value;

  if (password !== passwordConfirm) {
    messageEl.textContent = 'Sifreler eslesmiyor';
    messageEl.classList.add('error');
    return;
  }

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name, email, password, department_id, manager_id }),
    });
    const data = await res.json();

    if (!res.ok) {
      const detail = data.errors ? data.errors.map((e) => e.msg).join(', ') : data.message;
      messageEl.textContent = detail || 'Kayit basarisiz';
      messageEl.classList.add('error');
      return;
    }

    messageEl.textContent = 'Kayit basarili, giris sayfasina yonlendiriliyorsunuz...';
    messageEl.classList.add('success');
    setTimeout(() => {
      window.location.href = '/login';
    }, 1200);
  } catch (err) {
    messageEl.textContent = 'Sunucuya baglanilamadi';
    messageEl.classList.add('error');
  }
});

loadDepartments();
loadManagers();
