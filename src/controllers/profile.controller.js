const profileService = require('../services/profile.service');

async function getOwn(req, res) {
  try {
    const profile = await profileService.getProfile(req.session.user.id);
    res.json({ profile });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

async function updateOwn(req, res) {
  try {
    const { full_name, email } = req.body;
    const profile_photo = req.file ? req.file.filename : undefined;
    const updated = await profileService.updateProfile(req.session.user.id, { full_name, email, profile_photo });

    req.session.user.full_name = updated.full_name;
    req.session.user.email = updated.email;
    if (profile_photo !== undefined) {
      req.session.user.profile_photo = updated.profile_photo;
    }

    res.json({ message: 'Profil guncellendi', profile: updated });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Sunucu hatasi' });
  }
}

module.exports = { getOwn, updateOwn };
