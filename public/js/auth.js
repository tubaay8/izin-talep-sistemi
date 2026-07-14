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
