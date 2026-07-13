(function insertSidebarProfileLink() {
  const logoutBtn = document.getElementById('sidebar-logout-btn');
  if (!logoutBtn) return;

  const isActive = window.location.pathname === '/profile';
  const link = document.createElement('a');
  link.href = '/profile';
  link.className = `sidebar-profile-link${isActive ? ' active' : ''}`;
  link.innerHTML =
    '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg><span class="sidebar-label">Profilim</span>';

  logoutBtn.before(link);
})();
