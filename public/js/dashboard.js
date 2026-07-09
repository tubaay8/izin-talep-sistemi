const ICONS = {
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg>',
  ban: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M6.5 6.5l11 11"/></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 13.5c2.8.3 5 2.5 5 5.5"/></svg>',
  userCheck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6"/><path d="M16.5 12.5l1.5 1.5 3-3"/></svg>',
  userX: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6"/><path d="M16 11l5 5M21 11l-5 5"/></svg>',
  building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18"/><path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1"/></svg>',
  award: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M8.5 12.5L7 21l5-2.5L17 21l-1.5-8.5"/></svg>',
  userPlus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6"/><path d="M19 8v6M16 11h6"/></svg>',
  arrowRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  plusCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>',
};

const ACTIVITY_ICONS = {
  'leave_request.created': 'plusCircle',
  'leave_request.updated': 'list',
  'leave_request.cancelled': 'ban',
  'leave_request.approved': 'check',
  'leave_request.rejected': 'x',
  'leave_request.reopened': 'clock',
  'user.created': 'userPlus',
  'user.activated': 'userCheck',
  'user.deactivated': 'userX',
  'user.role_changed': 'users',
  'user.department_changed': 'building',
};

const STATUS_LABELS = {
  pending: 'Bekliyor',
  approved: 'Onaylandi',
  rejected: 'Reddedildi',
  cancelled: 'Iptal Edildi',
};

const ROLE_CONTENT = {
  Admin: 'Sistemdeki tum kullanicilari ve izin taleplerini yonetebilirsiniz.',
  Yonetici: 'Kendi personelinizin izin taleplerini goruntuleyip onaylayabilir/reddedebilirsiniz.',
  Personel: 'Izin talebi olusturabilir ve kendi taleplerinizi takip edebilirsiniz.',
};

function formatDate(value) {
  return new Date(value).toLocaleDateString('tr-TR');
}

function statusBadge(status) {
  return `<span class="status-badge status-${status}">${STATUS_LABELS[status]}</span>`;
}

function statCard({ icon, tone, value, label }) {
  return `
    <div class="stat-card ${tone}">
      <div class="stat-icon">${ICONS[icon]}</div>
      <div class="stat-body">
        <span class="stat-value">${value}</span>
        <span class="stat-label">${label}</span>
      </div>
    </div>
  `;
}

function quickLink(href, icon, label) {
  return `<a class="quick-link" href="${href}"><span>${label}</span>${ICONS[icon]}</a>`;
}

function emptyState(text) {
  return `<p class="empty-state">${text}</p>`;
}

function formatDateTime(value) {
  return new Date(value).toLocaleString('tr-TR');
}

function buildActivityPanel(activities) {
  const items = activities.length
    ? activities
        .map(
          (a) => `
      <li class="activity-item">
        <div class="activity-icon">${ICONS[ACTIVITY_ICONS[a.action_type] || 'list']}</div>
        <div class="activity-body">
          <p class="activity-desc">${a.description}</p>
          <p class="activity-meta">${a.actor_name} (${a.actor_role}) &middot; ${formatDateTime(a.created_at)}</p>
        </div>
      </li>`
        )
        .join('')
    : '';

  return `
    <div class="panel">
      <div class="panel-header"><h2>${ICONS.clock}Son Aktiviteler</h2></div>
      ${activities.length ? `<ul class="activity-feed">${items}</ul>` : emptyState('Henuz aktivite bulunmuyor.')}
    </div>
  `;
}

function renderPersonnelDashboard(user, data) {
  document.getElementById('stats-grid').innerHTML = [
    statCard({ icon: 'list', tone: 'tone-neutral', value: data.stats.total, label: 'Toplam Izin Talebi' }),
    statCard({ icon: 'clock', tone: 'tone-pending', value: data.stats.pending, label: 'Bekleyen Talepler' }),
    statCard({ icon: 'check', tone: 'tone-approved', value: data.stats.approved, label: 'Onaylanan Talepler' }),
    statCard({ icon: 'x', tone: 'tone-rejected', value: data.stats.rejected, label: 'Reddedilen Talepler' }),
    statCard({ icon: 'ban', tone: 'tone-cancelled', value: data.stats.cancelled, label: 'Iptal Edilen Talepler' }),
  ].join('');

  const rows = data.recent.length
    ? data.recent
        .map(
          (r) => `
      <tr>
        <td>${r.leave_type_name}</td>
        <td>${formatDate(r.start_date)}</td>
        <td>${formatDate(r.end_date)}</td>
        <td>${statusBadge(r.status)}</td>
      </tr>`
        )
        .join('')
    : '';

  document.getElementById('main-column').innerHTML = `
    <div class="panel">
      <div class="panel-header"><h2>${ICONS.list}Son 5 Izin Talebim</h2></div>
      ${
        data.recent.length
          ? `<div class="table-scroll"><table class="data-table"><thead><tr><th>Izin Turu</th><th>Baslangic</th><th>Bitis</th><th>Durum</th></tr></thead><tbody>${rows}</tbody></table></div>`
          : emptyState('Henuz izin talebiniz yok.')
      }
    </div>
    ${buildActivityPanel(data.activities)}
  `;

  document.getElementById('quick-links').innerHTML = [
    quickLink('/leave-requests', 'arrowRight', 'Tum Izin Taleplerim'),
    quickLink('/leave-requests/report', 'arrowRight', 'Izin Raporum'),
  ].join('');

  const primaryAction = document.getElementById('primary-action');
  primaryAction.innerHTML = `${ICONS.plusCircle}Yeni Izin Talebi Olustur`;
  primaryAction.href = '/leave-requests/new';
  primaryAction.hidden = false;
}

async function submitManagerDecision(id, decision) {
  let approval_note = '';
  if (decision === 'approved') {
    const confirmed = await confirmApproveRequest();
    if (!confirmed) return;
  } else {
    const result = await confirmRejectRequest();
    if (!result) return;
    approval_note = result.note;
  }

  const res = await fetch(`/api/manager/leave-requests/${id}/decision`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decision, approval_note }),
  });
  if (res.ok) {
    loadDashboard();
  } else {
    const data = await res.json();
    showErrorDialog(data.message || 'Islem basarisiz');
  }
}

function renderManagerDashboard(user, data) {
  document.getElementById('stats-grid').innerHTML = [
    statCard({ icon: 'users', tone: 'tone-info', value: data.stats.teamSize, label: 'Bana Bagli Personel' }),
    statCard({ icon: 'clock', tone: 'tone-pending', value: data.stats.pending, label: 'Bekleyen Onay Sayisi' }),
    statCard({ icon: 'check', tone: 'tone-approved', value: data.stats.approvedToday, label: 'Bugun Onaylanan' }),
    statCard({ icon: 'x', tone: 'tone-rejected', value: data.stats.rejectedToday, label: 'Bugun Reddedilen' }),
  ].join('');

  const rows = data.recent.length
    ? data.recent
        .map(
          (r) => `
      <tr>
        <td>${r.employee_name}</td>
        <td>${r.leave_type_name}</td>
        <td>${formatDate(r.start_date)} - ${formatDate(r.end_date)}</td>
        <td>${statusBadge(r.status)}</td>
        <td>${
          r.status === 'pending'
            ? `<div class="quick-actions">
                <button class="btn-approve" data-id="${r.id}" data-decision="approved">${ICONS.check}Onayla</button>
                <button class="btn-reject" data-id="${r.id}" data-decision="rejected">${ICONS.x}Reddet</button>
              </div>`
            : '-'
        }</td>
      </tr>`
        )
        .join('')
    : '';

  document.getElementById('main-column').innerHTML = `
    <div class="panel">
      <div class="panel-header"><h2>${ICONS.list}Son Gelen Izin Talepleri</h2></div>
      ${
        data.recent.length
          ? `<div class="table-scroll"><table class="data-table"><thead><tr><th>Personel</th><th>Izin Turu</th><th>Tarih</th><th>Durum</th><th>Islemler</th></tr></thead><tbody id="manager-recent-body">${rows}</tbody></table></div>`
          : emptyState('Ekibinize ait izin talebi bulunmuyor.')
      }
    </div>
    ${buildActivityPanel(data.activities)}
  `;

  const recentBody = document.getElementById('manager-recent-body');
  if (recentBody) {
    recentBody.addEventListener('click', (event) => {
      const target = event.target.closest('[data-decision]');
      if (!target) return;
      const id = target.getAttribute('data-id');
      const decision = target.getAttribute('data-decision');
      if (id && decision) {
        submitManagerDecision(id, decision);
      }
    });
  }

  document.getElementById('quick-links').innerHTML = [
    quickLink('/manager/leave-requests', 'arrowRight', 'Tum Ekip Talepleri'),
    quickLink('/manager/reports', 'arrowRight', 'Ekip Izin Raporu'),
  ].join('');

  const primaryAction = document.getElementById('primary-action');
  primaryAction.innerHTML = `${ICONS.users}Ekip Taleplerini Gor`;
  primaryAction.href = '/manager/leave-requests';
  primaryAction.hidden = false;
}

function renderAdminDashboard(user, data) {
  document.body.classList.add('admin-layout');

  const sidebarAvatar = document.getElementById('sidebar-avatar');
  const sidebarName = document.getElementById('sidebar-profile-name');
  const sidebarEmail = document.getElementById('sidebar-profile-email');
  if (sidebarAvatar && sidebarName && sidebarEmail) {
    const initials = user.full_name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('');
    sidebarAvatar.textContent = initials;
    sidebarName.textContent = user.full_name;
    sidebarEmail.textContent = user.email;
  }

  const mostUsed = data.stats.mostUsedLeaveType;

  document.getElementById('stats-grid').innerHTML = [
    statCard({ icon: 'users', tone: 'tone-neutral', value: data.stats.totalUsers, label: 'Toplam Kullanici' }),
    statCard({ icon: 'userCheck', tone: 'tone-approved', value: data.stats.activeUsers, label: 'Aktif Kullanici' }),
    statCard({ icon: 'userX', tone: 'tone-rejected', value: data.stats.inactiveUsers, label: 'Pasif Kullanici' }),
    statCard({ icon: 'building', tone: 'tone-info', value: data.stats.totalDepartments, label: 'Toplam Departman' }),
    statCard({ icon: 'list', tone: 'tone-neutral', value: data.stats.totalLeaveRequests, label: 'Toplam Izin Talebi' }),
    statCard({ icon: 'clock', tone: 'tone-pending', value: data.stats.pending, label: 'Bekleyen Talepler' }),
    statCard({ icon: 'check', tone: 'tone-approved', value: data.stats.approved, label: 'Onaylanan Talepler' }),
    statCard({ icon: 'x', tone: 'tone-rejected', value: data.stats.rejected, label: 'Reddedilen Talepler' }),
    statCard({ icon: 'ban', tone: 'tone-cancelled', value: data.stats.cancelled, label: 'Iptal Edilen Talepler' }),
    statCard({
      icon: 'award',
      tone: 'tone-info',
      value: mostUsed ? mostUsed.name : '-',
      label: mostUsed ? `En Cok Kullanilan Izin Turu (${mostUsed.count} talep)` : 'En Cok Kullanilan Izin Turu',
    }),
  ].join('');

  const requestRows = data.recentRequests.length
    ? data.recentRequests
        .map(
          (r) => `
      <tr>
        <td>${r.employee_name}</td>
        <td>${r.department_name}</td>
        <td>${r.leave_type_name}</td>
        <td>${formatDate(r.start_date)} - ${formatDate(r.end_date)}</td>
        <td>${statusBadge(r.status)}</td>
      </tr>`
        )
        .join('')
    : '';

  const userRows = data.recentUsers.length
    ? data.recentUsers
        .map(
          (u) => `
      <tr>
        <td>${u.full_name}</td>
        <td>${u.email}</td>
        <td>${u.role_name}</td>
        <td>${u.department_name}</td>
        <td>${formatDate(u.created_at)}</td>
      </tr>`
        )
        .join('')
    : '';

  document.getElementById('main-column').innerHTML = `
    <div class="panel">
      <div class="panel-header"><h2>${ICONS.list}Son Olusturulan Izin Talepleri</h2></div>
      ${
        data.recentRequests.length
          ? `<div class="table-scroll"><table class="data-table"><thead><tr><th>Personel</th><th>Departman</th><th>Izin Turu</th><th>Tarih</th><th>Durum</th></tr></thead><tbody>${requestRows}</tbody></table></div>`
          : emptyState('Henuz izin talebi bulunmuyor.')
      }
    </div>
    <div class="panel">
      <div class="panel-header"><h2>${ICONS.userPlus}Son Eklenen Kullanicilar</h2></div>
      ${
        data.recentUsers.length
          ? `<div class="table-scroll"><table class="data-table"><thead><tr><th>Ad Soyad</th><th>E-posta</th><th>Rol</th><th>Departman</th><th>Kayit Tarihi</th></tr></thead><tbody>${userRows}</tbody></table></div>`
          : emptyState('Henuz kullanici bulunmuyor.')
      }
    </div>
    ${buildActivityPanel(data.activities)}
  `;

  const primaryAction = document.getElementById('primary-action');
  primaryAction.innerHTML = `${ICONS.building}Kullanici Yonetimine Git`;
  primaryAction.href = '/admin/users';
  primaryAction.hidden = false;
}

async function loadDashboard() {
  try {
    const meRes = await fetch('/api/auth/me');
    if (!meRes.ok) {
      window.location.href = '/login';
      return;
    }
    const { user } = await meRes.json();
    document.getElementById('user-name').textContent = user.full_name;
    document.getElementById('role-badge').textContent = user.role_name;
    document.getElementById('role-content').textContent = ROLE_CONTENT[user.role_name] || '';

    const statsRes = await fetch('/api/stats');
    if (!statsRes.ok) return;
    const data = await statsRes.json();

    if (data.scope === 'all') {
      renderAdminDashboard(user, data);
    } else if (data.scope === 'team') {
      renderManagerDashboard(user, data);
    } else {
      renderPersonnelDashboard(user, data);
    }
  } catch (err) {
    window.location.href = '/login';
  }
}

async function handleLogout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/login';
}

document.getElementById('logout-btn').addEventListener('click', handleLogout);

const sidebarLogoutBtn = document.getElementById('sidebar-logout-btn');
if (sidebarLogoutBtn) {
  sidebarLogoutBtn.addEventListener('click', handleLogout);
}

loadDashboard();
