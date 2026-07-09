const authService = require('../services/auth.service');

async function register(req, res) {
  try {
    const { full_name, email, password, department_id, manager_id } = req.body;
    const userId = await authService.register({ full_name, email, password, department_id, manager_id });
    res.status(201).json({ message: 'Kayit basarili', userId });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await authService.login({ email, password });

    req.session.user = user;

    res.json({ message: 'Giris basarili', user, redirectUrl: '/dashboard' });
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

module.exports = { register, login, logout, me };
