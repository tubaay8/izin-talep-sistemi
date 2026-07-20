const authService = require('../services/auth.service');
const passwordResetService = require('../services/passwordReset.service');

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await authService.login({ email, password });

    req.session.user = user;

    res.json({
      message: 'Giris basarili',
      user,
      redirectUrl: user.must_change_password ? '/change-password' : '/dashboard',
    });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

function logout(req, res) {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Cikis yapildi' });
  });
}

function me(req, res) {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Oturum bulunamadi' });
  }
  res.json({ user: req.session.user });
}

async function changePassword(req, res) {
  try {
    const { new_password } = req.body;
    await authService.changePassword(req.session.user.id, new_password);
    req.session.user.must_change_password = false;
    res.json({ message: 'Sifre guncellendi', redirectUrl: '/dashboard' });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const result = await passwordResetService.requestReset(email);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, new_password } = req.body;
    await passwordResetService.resetPassword(token, new_password);
    res.json({ message: 'Sifreniz basariyla guncellendi' });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

module.exports = { login, logout, me, changePassword, forgotPassword, resetPassword };
