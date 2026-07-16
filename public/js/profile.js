const ICONS = {
  grid: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  list: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>',
  users: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 13.5c2.8.3 5 2.5 5 5.5"/></svg>',
  building: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18"/><path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1"/></svg>',
  plusCircle: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>',
  calendar: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
  calendarView: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><circle cx="8" cy="15" r="1"/><circle cx="12" cy="15" r="1"/><circle cx="16" cy="15" r="1"/></svg>',
  barChart: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M12 20V4M20 20v-7"/><path d="M2 20h20"/></svg>',
  lineChart: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/></svg>',
};

const ROLE_SIDEBAR_MENUS = {
  Personel: [
    ['/dashboard', 'grid', 'Anasayfa'],
    ['/leave-requests', 'list', 'İzin Taleplerim'],
    ['/leave-requests/new', 'plusCircle', 'Yeni İzin Talebi'],
    ['/leave-requests/report', 'barChart', 'İzin Raporum'],
  ],
  Yonetici: [
    ['/dashboard', 'grid', 'Anasayfa'],
    ['/manager/leave-requests', 'list', 'Ekip Talepleri'],
    ['/manager/calendar', 'calendarView', 'Takvim'],
    ['/manager/statistics', 'lineChart', 'İstatistikler'],
  ],
  Admin: [
    ['/dashboard', 'grid', 'Anasayfa'],
    ['/admin/users', 'users', 'Kullanıcı Yönetimi'],
    ['/admin/leave-requests', 'list', 'Tüm İzin Talepleri'],
    ['/admin/calendar', 'calendarView', 'Takvim'],
    ['/admin/departments', 'building', 'Departman Yönetimi'],
    ['/admin/leave-types', 'calendar', 'İzin Türü Yönetimi'],
    ['/admin/reports', 'barChart', 'Raporlar'],
  ],
};

function sidebarLink(href, icon, label) {
  return `<a href="${href}" class="sidebar-link">${ICONS[icon]}<span class="sidebar-label">${label}</span></a>`;
}

function getInitials(fullName) {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

const form = document.getElementById('profile-form');
const messageEl = document.getElementById('form-message');
const fullNameInput = document.getElementById('full_name');
const emailInput = document.getElementById('email');
const photoInput = document.getElementById('profile_photo');
const avatarText = document.getElementById('profile-avatar');
const avatarImg = document.getElementById('profile-avatar-img');
const roleEl = document.getElementById('profile-role');
const departmentEl = document.getElementById('profile-department');
const managerEl = document.getElementById('profile-manager');
const statusEl = document.getElementById('profile-status');
const createdAtEl = document.getElementById('profile-created-at');
const lastLoginEl = document.getElementById('profile-last-login');

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function showAvatarPhoto(url) {
  avatarImg.src = url;
  avatarImg.hidden = false;
  avatarText.hidden = true;
}

function showAvatarInitials(fullName) {
  avatarText.textContent = getInitials(fullName);
  avatarText.hidden = false;
  avatarImg.hidden = true;
}

function updateSidebarAvatar(profile) {
  const sidebarAvatarEl = document.getElementById('sidebar-avatar');
  if (!sidebarAvatarEl) return;
  if (profile.profile_photo) {
    sidebarAvatarEl.innerHTML = `<img src="/avatars/${profile.profile_photo}" alt="" />`;
  } else {
    sidebarAvatarEl.textContent = getInitials(profile.full_name);
  }
}

photoInput.addEventListener('change', () => {
  const file = photoInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => showAvatarPhoto(reader.result);
  reader.readAsDataURL(file);
});

async function loadProfile() {
  const res = await fetch('/api/profile');
  const data = await res.json();

  if (!res.ok) {
    messageEl.textContent = data.message || 'Profil yuklenemedi';
    messageEl.className = 'form-message error';
    return;
  }

  const profile = data.profile;
  fullNameInput.value = profile.full_name;
  emailInput.value = profile.email;
  roleEl.textContent = profile.role_name;
  departmentEl.textContent = profile.department_name || '-';
  managerEl.textContent = profile.manager_name || '-';
  statusEl.innerHTML = `<span class="status-badge ${profile.is_active ? 'status-approved' : 'status-rejected'}">${
    profile.is_active ? 'Aktif' : 'Pasif'
  }</span>`;
  if (createdAtEl) createdAtEl.textContent = formatDate(profile.created_at);
  if (lastLoginEl) lastLoginEl.textContent = formatDate(profile.updated_at);

  if (profile.profile_photo) {
    showAvatarPhoto(`/avatars/${profile.profile_photo}`);
  } else {
    showAvatarInitials(profile.full_name);
  }

  const sidebarMenu = document.getElementById('sidebar-menu');
  sidebarMenu.innerHTML = (ROLE_SIDEBAR_MENUS[profile.role_name] || [])
    .map(([href, icon, label]) => sidebarLink(href, icon, label))
    .join('');
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  messageEl.textContent = '';
  messageEl.className = 'form-message';

  const formData = new FormData();
  formData.append('full_name', fullNameInput.value);
  formData.append('email', emailInput.value);
  if (photoInput.files[0]) {
    formData.append('profile_photo', photoInput.files[0]);
  }

  try {
    const res = await fetch('/api/profile', { method: 'PUT', body: formData });
    const data = await res.json();

    if (!res.ok) {
      const detail = data.errors ? data.errors.map((e) => e.msg).join(', ') : data.message;
      messageEl.textContent = detail || 'Islem basarisiz';
      messageEl.classList.add('error');
      return;
    }

    messageEl.textContent = 'Profil basariyla guncellendi';
    messageEl.classList.add('success');

    const headerNameEl = document.getElementById('user-name');
    const sidebarNameEl = document.getElementById('sidebar-profile-name');
    const sidebarEmailEl = document.getElementById('sidebar-profile-email');
    if (headerNameEl) headerNameEl.textContent = data.profile.full_name;
    if (sidebarNameEl) sidebarNameEl.textContent = data.profile.full_name;
    if (sidebarEmailEl) sidebarEmailEl.textContent = data.profile.email;
    updateSidebarAvatar(data.profile);
  } catch (err) {
    messageEl.textContent = 'Sunucuya baglanilamadi';
    messageEl.classList.add('error');
  }
});

loadProfile();
