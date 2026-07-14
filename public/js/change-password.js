const form = document.getElementById('change-password-form');
const messageEl = document.getElementById('change-password-message');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  messageEl.textContent = '';
  messageEl.className = 'auth-message';

  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('new-password-confirm').value;

  if (newPassword !== confirmPassword) {
    messageEl.textContent = 'Sifreler eslesmiyor';
    messageEl.classList.add('error');
    return;
  }

  try {
    const res = await fetch('/api/auth/change-password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ new_password: newPassword }),
    });
    const data = await res.json();

    if (!res.ok) {
      const detail = data.errors ? data.errors.map((e) => e.msg).join(', ') : data.message;
      messageEl.textContent = detail || 'Islem basarisiz';
      messageEl.classList.add('error');
      return;
    }

    window.location.href = data.redirectUrl || '/dashboard';
  } catch (err) {
    messageEl.textContent = 'Sunucuya baglanilamadi';
    messageEl.classList.add('error');
  }
});

document.getElementById('logout-btn').addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/login';
});
