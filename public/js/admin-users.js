const tbody = document.getElementById('users-body');
const messageEl = document.getElementById('list-message');
const filterSearch = document.getElementById('filter-search');
const filterRole = document.getElementById('filter-role');
const filterDepartment = document.getElementById('filter-department');
const filterActive = document.getElementById('filter-active');
const filterClear = document.getElementById('filter-clear');

async function loadFilterOptions() {
  const [rolesRes, departmentsRes] = await Promise.all([fetch('/api/roles'), fetch('/api/departments')]);
  const rolesData = await rolesRes.json();
  const departmentsData = await departmentsRes.json();

  rolesData.roles.forEach((role) => {
    const option = document.createElement('option');
    option.value = role.id;
    option.textContent = role.name;
    filterRole.appendChild(option);
  });

  departmentsData.departments.forEach((dept) => {
    const option = document.createElement('option');
    option.value = dept.id;
    option.textContent = dept.name;
    filterDepartment.appendChild(option);
  });
}

function buildFilterQuery() {
  const params = new URLSearchParams();
  if (filterSearch.value.trim()) params.set('search', filterSearch.value.trim());
  if (filterRole.value) params.set('role_id', filterRole.value);
  if (filterDepartment.value) params.set('department_id', filterDepartment.value);
  if (filterActive.value) params.set('is_active', filterActive.value);
  return params.toString();
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function sortUsers(users) {
  return [...users].sort((a, b) => {
    if (a.is_active !== b.is_active) {
      return b.is_active - a.is_active;
    }
    return a.full_name.localeCompare(b.full_name, 'tr');
  });
}

function renderRow(user) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${user.full_name}</td>
    <td>${user.email}</td>
    <td>${user.role_name}</td>
    <td>${user.department_name}</td>
    <td>${user.manager_name || '-'}</td>
    <td><span class="status-badge ${user.is_active ? 'status-approved' : 'status-rejected'}">${user.is_active ? 'Aktif' : 'Pasif'}</span></td>
    <td><a href="/admin/users/edit?id=${user.id}" class="link-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>Duzenle</a></td>
  `;
  return tr;
}

async function loadUsers() {
  try {
    const query = buildFilterQuery();
    const res = await fetch(`/api/admin/users${query ? `?${query}` : ''}`);
    if (!res.ok) {
      const data = await res.json();
      messageEl.textContent = data.message || 'Kullanicilar yuklenemedi';
      messageEl.className = 'form-message error';
      return;
    }
    const data = await res.json();
    tbody.innerHTML = '';

    if (data.users.length === 0) {
      messageEl.textContent = 'Kriterlere uyan kullanici bulunamadi.';
      messageEl.className = 'form-message';
      return;
    }

    messageEl.textContent = '';
    sortUsers(data.users).forEach((user) => {
      tbody.appendChild(renderRow(user));
    });
  } catch (err) {
    messageEl.textContent = 'Kullanicilar yuklenirken bir hata olustu';
    messageEl.className = 'form-message error';
  }
}

const debouncedLoadUsers = debounce(loadUsers, 300);

filterSearch.addEventListener('input', debouncedLoadUsers);
[filterRole, filterDepartment, filterActive].forEach((field) => {
  field.addEventListener('change', loadUsers);
});

filterClear.addEventListener('click', () => {
  filterSearch.value = '';
  filterRole.value = '';
  filterDepartment.value = '';
  filterActive.value = '';
  loadUsers();
});

loadFilterOptions().then(loadUsers);
