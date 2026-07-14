// Gecici sifreyle olusturulan kullanicilar sifrelerini degistirmeden
// bu iki adresin disinda hicbir sayfaya/API'ye erisemez.
const PASSWORD_CHANGE_EXEMPT_PATHS = ['/change-password', '/api/auth/change-password'];

function requireAuth(req, res, next) {
  if (!req.session.user) {
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(401).json({ message: 'Oturum acmaniz gerekiyor' });
    }
    return res.redirect('/login');
  }

  if (req.session.user.must_change_password && !PASSWORD_CHANGE_EXEMPT_PATHS.includes(req.originalUrl)) {
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(403).json({ message: 'Once sifrenizi degistirmeniz gerekiyor', mustChangePassword: true });
    }
    return res.redirect('/change-password');
  }

  next();
}

function requireGuest(req, res, next) {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session.user || !roles.includes(req.session.user.role_name)) {
      return res.status(403).json({ message: 'Bu islem icin yetkiniz yok' });
    }
    next();
  };
}

module.exports = { requireAuth, requireGuest, requireRole };
