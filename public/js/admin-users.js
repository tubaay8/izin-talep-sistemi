const PAGE_SIZE = 20;

const grid = document.getElementById('users-grid');
const messageEl = document.getElementById('list-message');
const filterSearch = document.getElementById('filter-search');
const filterRole = document.getElementById('filter-role');
const filterDepartment = document.getElementById('filter-department');
const filterActive = document.getElementById('filter-active');
const filterClear = document.getElementById('filter-clear');
const paginationEl = document.getElementById('pagination');

const drawer = document.getElementById('user-drawer');
const drawerBackdrop = document.getElementById('user-drawer-backdrop');
const drawerClose = document.getElementById('drawer-close');
const drawerEditLink = document.getElementById('drawer-edit-link');
const drawerResetPasswordBtn = document.getElementById('drawer-reset-password');
const drawerToggleActiveBtn = document.getElementById('drawer-toggle-active');

let currentPage = 1;
let currentUser = null;
let selectedCard = null;

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
  params.set('page', currentPage);
  params.set('limit', PAGE_SIZE);
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

function initials(fullName) {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function avatarTone(fullName) {
  let sum = 0;
  for (const ch of fullName) sum += ch.charCodeAt(0);
  return (sum % 6) + 1;
}

function rolePillClass(roleName) {
  if (roleName === 'Admin') return 'role-pill--admin';
  if (roleName === 'Yonetici' || roleName === 'Yönetici') return 'role-pill--yonetici';
  return 'role-pill--personel';
}

function formatDateTR(value) {
  if (!value) return '-';
  const d = new Date(value);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}.${d.getFullYear()}`;
}

function renderCard(user) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'user-card';
  const tone = avatarTone(user.full_name);
  const avatarInner = user.profile_photo
    ? `<img src="/avatars/${user.profile_photo}" alt="" onerror="this.outerHTML='${initials(user.full_name)}'" style="width:100%; height:100%; object-fit:cover; border-radius:50%;" />`
    : initials(user.full_name);
  card.innerHTML = `
    <span class="user-card-avatar" style="background:var(--avatar-${tone}-bg); color:var(--avatar-${tone}-fg); overflow:hidden;">${avatarInner}</span>
    <span class="user-card-name">${user.full_name}</span>
    <span class="role-pill ${rolePillClass(user.role_name)}">${user.role_name}</span>
    <span class="user-card-dept">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18"/><path d="M9 8h1M14 8h1M9 12h1M14 12h1"/></svg>
      ${user.department_name}
    </span>
    <span class="user-card-status"><span class="status-dot ${user.is_active ? '' : 'is-off'}"></span>${user.is_active ? 'Aktif' : 'Pasif'}</span>
  `;
  card.addEventListener('click', () => openDrawer(user, card));
  return card;
}

function openDrawer(user, card) {
  if (selectedCard) selectedCard.classList.remove('is-selected');
  selectedCard = card;
  if (card) card.classList.add('is-selected');
  currentUser = user;

  const tone = avatarTone(user.full_name);
  const avatarEl = document.getElementById('drawer-avatar');
  if (user.profile_photo) {
    avatarEl.innerHTML = `<img src="/avatars/${user.profile_photo}" alt="" onerror="this.outerHTML='${initials(user.full_name)}'" style="width:100%; height:100%; object-fit:cover; border-radius:50%;" />`;
  } else {
    avatarEl.textContent = initials(user.full_name);
  }
  avatarEl.style.background = `var(--avatar-${tone}-bg)`;
  avatarEl.style.color = `var(--avatar-${tone}-fg)`;
  avatarEl.style.overflow = 'hidden';

  document.getElementById('drawer-name').textContent = user.full_name;
  const roleEl = document.getElementById('drawer-role');
  roleEl.textContent = user.role_name;
  roleEl.className = `role-pill ${rolePillClass(user.role_name)}`;

  document.getElementById('drawer-email').textContent = user.email;
  document.getElementById('drawer-dept').textContent = user.department_name;
  document.getElementById('drawer-manager').textContent = user.manager_name || '-';
  document.getElementById('drawer-balance').textContent = user.leave_balance
    ? `${user.leave_balance.remainingDays} / ${user.leave_balance.entitledDays} gün`
    : '-';
  document.getElementById('drawer-created').textContent = formatDateTR(user.created_at);
  document.getElementById('drawer-status').innerHTML = `<span style="color:${user.is_active ? 'var(--badge-green)' : 'var(--badge-red)'}">${user.is_active ? 'Aktif' : 'Pasif'}</span>`;

  drawerEditLink.href = `/admin/users/edit?id=${user.id}`;
  drawerToggleActiveBtn.innerHTML = user.is_active
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg>Pasif Yap'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>Aktif Yap';

  drawer.classList.add('is-open');
  drawerBackdrop.classList.add('is-open');
  drawer.setAttribute('aria-hidden', 'false');
}

function closeDrawer() {
  drawer.classList.remove('is-open');
  drawerBackdrop.classList.remove('is-open');
  drawer.setAttribute('aria-hidden', 'true');
  if (selectedCard) selectedCard.classList.remove('is-selected');
  selectedCard = null;
  currentUser = null;
}

drawerClose.addEventListener('click', closeDrawer);
drawerBackdrop.addEventListener('click', closeDrawer);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeDrawer();
});

async function updateCurrentUser(payload) {
  const res = await fetch(`/api/admin/users/${currentUser.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_name: currentUser.full_name,
      email: currentUser.email,
      role_id: currentUser.role_id,
      department_id: currentUser.department_id,
      manager_id: currentUser.manager_id,
      is_active: currentUser.is_active,
      ...payload,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    const detail = data.errors ? data.errors.map((e) => e.msg).join(', ') : data.message;
    throw new Error(detail || 'Islem basarisiz');
  }
  return data.user;
}

drawerResetPasswordBtn.addEventListener('click', async () => {
  if (!currentUser) return;
  const newPassword = await confirmResetPassword(currentUser.full_name);
  if (!newPassword) return;

  try {
    await updateCurrentUser({ password: newPassword });
    showActionToast('Sifre guncellendi');
  } catch (err) {
    showErrorDialog(err.message);
  }
});

drawerToggleActiveBtn.addEventListener('click', async () => {
  if (!currentUser) return;
  const nextLabel = currentUser.is_active ? 'Pasif' : 'Aktif';
  const confirmed = await confirmStatusChange(nextLabel);
  if (!confirmed) return;

  try {
    const updated = await updateCurrentUser({ is_active: !currentUser.is_active });
    showActionToast(`Kullanici ${nextLabel.toLowerCase()} yapildi`);
    closeDrawer();
    loadUsers();
    void updated;
  } catch (err) {
    showErrorDialog(err.message);
  }
});

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
    grid.innerHTML = '';

    if (data.users.length === 0) {
      messageEl.textContent = 'Kriterlere uyan kullanici bulunamadi.';
      messageEl.className = 'form-message';
    } else {
      messageEl.textContent = '';
      sortUsers(data.users).forEach((user) => {
        grid.appendChild(renderCard(user));
      });
    }

    if (data.pagination) {
      renderPagination(paginationEl, {
        page: data.pagination.page,
        totalPages: data.pagination.totalPages,
        onChange: (page) => {
          currentPage = page;
          loadUsers();
        },
      });
    }
  } catch (err) {
    messageEl.textContent = 'Kullanicilar yuklenirken bir hata olustu';
    messageEl.className = 'form-message error';
  }
}

function loadUsersFromStart() {
  currentPage = 1;
  loadUsers();
}

const debouncedLoadUsers = debounce(loadUsersFromStart, 300);

filterSearch.addEventListener('input', debouncedLoadUsers);
[filterRole, filterDepartment, filterActive].forEach((field) => {
  field.addEventListener('change', loadUsersFromStart);
});

filterClear.addEventListener('click', () => {
  filterSearch.value = '';
  filterRole.value = '';
  filterDepartment.value = '';
  filterActive.value = '';
  loadUsersFromStart();
});

loadFilterOptions().then(loadUsers);
