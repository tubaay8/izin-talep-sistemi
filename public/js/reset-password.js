const resetForm = document.getElementById('reset-password-form');
const resetMessage = document.getElementById('reset-password-message');
const resetSubmitBtn = document.getElementById('reset-submit-btn');

const token = new URLSearchParams(window.location.search).get('token');

if (!token) {
  resetMessage.textContent = 'Gecersiz sifirlama baglantisi. Lutfen yeniden talep edin.';
  resetMessage.classList.add('error');
  resetForm.querySelectorAll('input, button').forEach((el) => { el.disabled = true; });
}

resetForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  resetMessage.textContent = '';
  resetMessage.className = 'auth-message';

  const newPassword = document.getElementById('reset-new-password').value;
  const confirmPassword = document.getElementById('reset-new-password-confirm').value;

  if (newPassword !== confirmPassword) {
    resetMessage.textContent = 'Sifreler eslesmiyor';
    resetMessage.classList.add('error');
    return;
  }

  resetSubmitBtn.disabled = true;

  try {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password: newPassword }),
    });
    const data = await res.json();

    if (!res.ok) {
      const detail = data.errors ? data.errors.map((e) => e.msg).join(', ') : data.message;
      resetMessage.textContent = detail || 'Islem basarisiz';
      resetMessage.classList.add('error');
      resetSubmitBtn.disabled = false;
      return;
    }

    resetMessage.textContent = `${data.message}. Giris sayfasina yonlendiriliyorsunuz...`;
    resetMessage.classList.add('success');
    setTimeout(() => { window.location.href = '/login'; }, 2000);
  } catch (err) {
    resetMessage.textContent = 'Sunucuya baglanilamadi';
    resetMessage.classList.add('error');
    resetSubmitBtn.disabled = false;
  }
});
