(function initThemeToggle() {
  const STORAGE_KEY = 'theme';
  const root = document.documentElement;
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const sunIcon = toggleBtn ? toggleBtn.querySelector('.icon-sun') : null;
  const moonIcon = toggleBtn ? toggleBtn.querySelector('.icon-moon') : null;

  function applyTheme(theme) {
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      if (sunIcon) sunIcon.hidden = true;
      if (moonIcon) moonIcon.hidden = false;
    } else {
      root.removeAttribute('data-theme');
      if (sunIcon) sunIcon.hidden = false;
      if (moonIcon) moonIcon.hidden = true;
    }
  }

  const savedTheme = localStorage.getItem(STORAGE_KEY) || 'light';
  applyTheme(savedTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isDark = root.getAttribute('data-theme') === 'dark';
      const nextTheme = isDark ? 'light' : 'dark';
      applyTheme(nextTheme);
      localStorage.setItem(STORAGE_KEY, nextTheme);
    });
  }
})();
