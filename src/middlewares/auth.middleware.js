function requireAuth(req, res, next) {
  if (!req.session.user) {
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(401).json({ message: 'Oturum acmaniz gerekiyor' });
    }
    return res.redirect('/login');
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
