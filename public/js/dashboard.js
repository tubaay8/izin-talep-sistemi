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
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
  calendarView: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><circle cx="8" cy="15" r="1"/><circle cx="12" cy="15" r="1"/><circle cx="16" cy="15" r="1"/></svg>',
  barChart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M12 20V4M20 20v-7"/><path d="M2 20h20"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>',
  lineChart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/></svg>',
};

const ACTIVITY_STYLE = {
  'leave_request.created': { icon: 'plusCircle', tone: 'tone-info' },
  'leave_request.updated': { icon: 'edit', tone: 'tone-pending' },
  'leave_request.cancelled': { icon: 'ban', tone: 'tone-cancelled' },
  'leave_request.approved': { icon: 'check', tone: 'tone-approved' },
  'leave_request.rejected': { icon: 'x', tone: 'tone-rejected' },
  'leave_request.reopened': { icon: 'clock', tone: 'tone-info' },
  'user.created': { icon: 'userPlus', tone: 'tone-info' },
  'user.activated': { icon: 'userCheck', tone: 'tone-approved' },
  'user.deactivated': { icon: 'userX', tone: 'tone-rejected' },
  'user.role_changed': { icon: 'users', tone: 'tone-pending' },
  'user.department_changed': { icon: 'building', tone: 'tone-pending' },
};

const LEAVE_ACTIVITY_TITLES = {
  'leave_request.created': 'Talebi Oluşturuldu',
  'leave_request.updated': 'Talebi Güncellendi',
  'leave_request.cancelled': 'Talebi İptal Edildi',
  'leave_request.approved': 'Talebi Onaylandı',
  'leave_request.rejected': 'Talebi Reddedildi',
  'leave_request.reopened': 'Talebi Tekrar Beklemeye Alındı',
};

const USER_ACTIVITY_TITLES = {
  'user.created': 'Yeni Kullanıcı',
  'user.activated': 'Kullanıcı Aktifleştirildi',
  'user.deactivated': 'Kullanıcı Pasifleştirildi',
  'user.role_changed': 'Kullanıcı Rolü Değiştirildi',
  'user.department_changed': 'Kullanıcı Departmanı Değiştirildi',
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

function sidebarLink(href, icon, label, active) {
  return `<a href="${href}" class="sidebar-link${active ? ' active' : ''}">${ICONS[icon]}<span class="sidebar-label">${label}</span></a>`;
}

function populateSidebarProfile(user) {
  const sidebarAvatar = document.getElementById('sidebar-avatar');
  const sidebarName = document.getElementById('sidebar-profile-name');
  const sidebarEmail = document.getElementById('sidebar-profile-email');
  if (!sidebarAvatar || !sidebarName || !sidebarEmail) return;

  if (user.profile_photo) {
    sidebarAvatar.innerHTML = `<img src="/avatars/${user.profile_photo}" alt="" />`;
  } else {
    const initials = user.full_name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('');
    sidebarAvatar.textContent = initials;
  }
  sidebarName.textContent = user.full_name;
  sidebarEmail.textContent = user.email;
}

function emptyState(text) {
  return `<p class="empty-state">${text}</p>`;
}

function formatActivityTime(value) {
  const date = new Date(value);
  const now = new Date();
  const time = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  const isToday =
    date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
  return isToday ? `Bugün ${time}` : `${formatDate(value)} ${time}`;
}

function parseLeaveRequestDetails(activity) {
  const desc = activity.description || '';
  let leaveType = null;
  let dateRange = null;
  let employeeName = null;

  const dateMatch = desc.match(/:\s*(.+?)\s*\((\d{4}-\d{2}-\d{2})\s*-\s*(\d{4}-\d{2}-\d{2})\)/);
  if (dateMatch) {
    leaveType = dateMatch[1];
    dateRange = `${formatDate(dateMatch[2])} - ${formatDate(dateMatch[3])}`;
  } else {
    const nameMatch = desc.match(/:\s*(.+?)\s*\(([^)]+)\)\s*$/);
    if (nameMatch) {
      leaveType = nameMatch[1];
      employeeName = nameMatch[2];
    } else {
      const plainMatch = desc.match(/:\s*(.+)$/);
      if (plainMatch) leaveType = plainMatch[1].trim();
    }
  }

  return {
    leaveType: leaveType || 'İzin Talebi',
    dateRange,
    employeeName: employeeName || activity.actor_name,
  };
}

function activityCard(activity) {
  const style = ACTIVITY_STYLE[activity.action_type] || { icon: 'list', tone: 'tone-neutral' };
  const isLeaveActivity = activity.action_type.startsWith('leave_request.');

  let title;
  let detailsHtml;

  if (isLeaveActivity) {
    const { leaveType, dateRange, employeeName } = parseLeaveRequestDetails(activity);
    title = `${leaveType} ${LEAVE_ACTIVITY_TITLES[activity.action_type] || ''}`;
    detailsHtml = `
      <div class="activity-details">
        <span class="activity-employee">${employeeName}</span>
        ${dateRange ? `<span>${dateRange}</span>` : ''}
      </div>
      <span class="activity-leave-badge">${leaveType}</span>
    `;
  } else {
    title = USER_ACTIVITY_TITLES[activity.action_type] || activity.description;
    detailsHtml = `<div class="activity-details"><span>${activity.description}</span></div>`;
  }

  return `
    <div class="activity-card">
      <div class="activity-icon-wrap ${style.tone}">${ICONS[style.icon]}</div>
      <div class="activity-content">
        <div class="activity-top">
          <h3 class="activity-title">${title}</h3>
          <span class="activity-time">${formatActivityTime(activity.created_at)}</span>
        </div>
        ${detailsHtml}
      </div>
    </div>
  `;
}

const ACTIVITY_PAGE_SIZE = 10;

function buildActivityPanel(activities) {
  if (!activities.length) {
    return `
      <div class="panel">
        <div class="panel-header"><h2>${ICONS.clock}Son Aktiviteler</h2></div>
        ${emptyState('Henuz aktivite bulunmuyor.')}
      </div>
    `;
  }

  return `
    <div class="panel">
      <div class="panel-header"><h2>${ICONS.clock}Son Aktiviteler</h2></div>
      <div class="activity-timeline" id="activity-timeline">
        ${activities.map(activityCard).join('')}
      </div>
      <div class="pagination" id="activity-pagination" hidden></div>
    </div>
  `;
}

function initActivityPagination(initialActivities) {
  const paginationEl = document.getElementById('activity-pagination');
  if (!paginationEl || !initialActivities.length) return;

  renderPagination(paginationEl, {
    page: 1,
    hasNext: initialActivities.length >= ACTIVITY_PAGE_SIZE,
    onChange: loadActivityPage,
  });
}

async function loadActivityPage(page) {
  const timeline = document.getElementById('activity-timeline');
  const paginationEl = document.getElementById('activity-pagination');
  if (!timeline || !paginationEl) return;

  try {
    const res = await fetch(`/api/stats/activities?page=${page}&limit=${ACTIVITY_PAGE_SIZE}`);
    if (!res.ok) return;
    const data = await res.json();

    timeline.innerHTML = data.activities.length
      ? data.activities.map(activityCard).join('')
      : emptyState('Bu sayfada aktivite bulunmuyor.');

    renderPagination(paginationEl, {
      page: data.pagination.page,
      totalPages: data.pagination.totalPages,
      onChange: loadActivityPage,
    });
  } catch (err) {
    // Sunucuya ulasilamadi, kullanici butona tekrar tiklayarak deneyebilir.
  }
}

function renderPersonnelDashboard(user, data) {
  document.getElementById('stats-grid').innerHTML = [
    statCard({
      icon: 'award',
      tone: 'tone-info',
      value: `${data.leaveBalance.remainingDays}/${data.leaveBalance.entitledDays}`,
      label: `${data.leaveBalance.year} Yillik Izin Sayisi (Kalan/Toplam)`,
    }),
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
  initActivityPagination(data.activities);

  document.getElementById('sidebar-menu').innerHTML = [
    sidebarLink('/dashboard', 'grid', 'Dashboard', true),
    sidebarLink('/leave-requests', 'list', 'Izin Taleplerim', false),
    sidebarLink('/leave-requests/new', 'plusCircle', 'Yeni Izin Talebi', false),
    sidebarLink('/leave-requests/report', 'barChart', 'Izin Raporum', false),
  ].join('');
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
        <td>${r.report_file ? `<a href="/api/leave-requests/${r.id}/report" target="_blank" class="report-badge">Raporu Gör</a>` : '-'}</td>
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
          ? `<div class="table-scroll"><table class="data-table"><thead><tr><th>Personel</th><th>Izin Turu</th><th>Tarih</th><th>Durum</th><th>Rapor</th><th>Islemler</th></tr></thead><tbody id="manager-recent-body">${rows}</tbody></table></div>`
          : emptyState('Ekibinize ait izin talebi bulunmuyor.')
      }
    </div>
    ${buildActivityPanel(data.activities)}
  `;
  initActivityPagination(data.activities);

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

  document.getElementById('sidebar-menu').innerHTML = [
    sidebarLink('/dashboard', 'grid', 'Dashboard', true),
    sidebarLink('/manager/leave-requests', 'list', 'Ekip Talepleri', false),
    sidebarLink('/manager/calendar', 'calendarView', 'Takvim', false),
    sidebarLink('/manager/statistics', 'lineChart', 'Istatistikler', false),
  ].join('');
}

function renderAdminDashboard(user, data) {
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
        <td>${r.report_file ? `<a href="/api/leave-requests/${r.id}/report" target="_blank" class="report-badge">Raporu Gör</a>` : '-'}</td>
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
          ? `<div class="table-scroll"><table class="data-table"><thead><tr><th>Personel</th><th>Departman</th><th>Izin Turu</th><th>Tarih</th><th>Durum</th><th>Rapor</th></tr></thead><tbody>${requestRows}</tbody></table></div>`
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
  initActivityPagination(data.activities);

  document.getElementById('sidebar-menu').innerHTML = [
    sidebarLink('/dashboard', 'grid', 'Dashboard', true),
    sidebarLink('/admin/users', 'users', 'Kullanici Yonetimi', false),
    sidebarLink('/admin/leave-requests', 'list', 'Tum Izin Talepleri', false),
    sidebarLink('/admin/calendar', 'calendarView', 'Takvim', false),
    sidebarLink('/admin/departments', 'building', 'Departman Yonetimi', false),
    sidebarLink('/admin/leave-types', 'calendar', 'Izin Turu Yonetimi', false),
    sidebarLink('/admin/reports', 'barChart', 'Raporlar', false),
  ].join('');
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
    populateSidebarProfile(user);

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
