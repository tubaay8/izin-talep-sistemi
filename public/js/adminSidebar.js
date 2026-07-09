(async function initAdminSidebar() {
  const avatarEl = document.getElementById('sidebar-avatar');
  const nameEl = document.getElementById('sidebar-profile-name');
  const emailEl = document.getElementById('sidebar-profile-email');
  const headerNameEl = document.getElementById('user-name');
  const headerRoleBadgeEl = document.getElementById('role-badge');

  try {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      const { user } = await res.json();
      if (avatarEl && nameEl && emailEl) {
        const initials = user.full_name
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0].toUpperCase())
          .join('');
        avatarEl.textContent = initials;
        nameEl.textContent = user.full_name;
        emailEl.textContent = user.email;
      }
      if (headerNameEl) headerNameEl.textContent = user.full_name;
      if (headerRoleBadgeEl) headerRoleBadgeEl.textContent = user.role_name;
    }
  } catch (err) {
    // Sidebar/header profil bilgisi gosterilemezse sayfa normal calismaya devam eder.
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  const sidebarLogoutBtn = document.getElementById('sidebar-logout-btn');
  if (sidebarLogoutBtn) {
    sidebarLogoutBtn.addEventListener('click', handleLogout);
  }

  const headerLogoutBtn = document.getElementById('logout-btn');
  if (headerLogoutBtn) {
    headerLogoutBtn.addEventListener('click', handleLogout);
  }
})();
