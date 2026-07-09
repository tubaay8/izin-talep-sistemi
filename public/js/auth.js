const authCard = document.getElementById('auth-card');

function showPanel(mode) {
  authCard.classList.toggle('show-register', mode === 'register');
  const path = mode === 'register' ? '/register' : '/login';
  if (window.location.pathname !== path) {
    history.pushState(null, '', path);
  }
}

document.querySelectorAll('[data-switch]').forEach((el) => {
  el.addEventListener('click', () => {
    showPanel(el.getAttribute('data-switch'));
  });
});

window.addEventListener('popstate', () => {
  showPanel(window.location.pathname === '/register' ? 'register' : 'login');
});

showPanel(window.location.pathname === '/register' ? 'register' : 'login');

const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginMessage.textContent = '';
  loginMessage.className = 'auth-message';

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      loginMessage.textContent = data.message || 'Giris basarisiz';
      loginMessage.classList.add('error');
      return;
    }

    window.location.href = data.redirectUrl || '/dashboard';
  } catch (err) {
    loginMessage.textContent = 'Sunucuya baglanilamadi';
    loginMessage.classList.add('error');
  }
});

const registerForm = document.getElementById('register-form');
const registerMessage = document.getElementById('register-message');
const departmentSelect = document.getElementById('register-department');
const managerSelect = document.getElementById('register-manager');

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
    registerMessage.textContent = 'Departmanlar yuklenemedi';
    registerMessage.classList.add('error');
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

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  registerMessage.textContent = '';
  registerMessage.className = 'auth-message';

  const full_name = document.getElementById('register-full-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const passwordConfirm = document.getElementById('register-password-confirm').value;
  const department_id = departmentSelect.value;
  const manager_id = managerSelect.value;

  if (password !== passwordConfirm) {
    registerMessage.textContent = 'Sifreler eslesmiyor';
    registerMessage.classList.add('error');
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
      registerMessage.textContent = detail || 'Kayit basarisiz';
      registerMessage.classList.add('error');
      return;
    }

    registerMessage.textContent = 'Kayit basarili, giris paneline yonlendiriliyorsunuz...';
    registerMessage.classList.add('success');
    registerForm.reset();
    setTimeout(() => {
      showPanel('login');
    }, 1200);
  } catch (err) {
    registerMessage.textContent = 'Sunucuya baglanilamadi';
    registerMessage.classList.add('error');
  }
});

loadDepartments();
loadManagers();
