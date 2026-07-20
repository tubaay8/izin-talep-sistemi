const forgotForm = document.getElementById('forgot-password-form');
const forgotMessage = document.getElementById('forgot-password-message');
const forgotSubmitBtn = document.getElementById('forgot-submit-btn');

forgotForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  forgotMessage.textContent = '';
  forgotMessage.className = 'auth-message';
  forgotSubmitBtn.disabled = true;

  const email = document.getElementById('forgot-email').value;

  try {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();

    if (!res.ok) {
      const detail = data.errors ? data.errors.map((e) => e.msg).join(', ') : data.message;
      forgotMessage.textContent = detail || 'Islem basarisiz, lutfen tekrar deneyin';
      forgotMessage.classList.add('error');
      return;
    }

    forgotMessage.textContent = data.message;
    forgotMessage.classList.add('success');
    forgotForm.reset();
  } catch (err) {
    forgotMessage.textContent = 'Sunucuya baglanilamadi';
    forgotMessage.classList.add('error');
  } finally {
    forgotSubmitBtn.disabled = false;
  }
});
