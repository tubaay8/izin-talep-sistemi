const userRepository = require('../repositories/user.repository');
const { toTitleCaseTR } = require('../utils/textFormat');
const activityLogService = require('./activityLog.service');

async function getProfile(userId) {
  const user = await userRepository.findByIdDetailed(userId);
  if (!user) {
    const error = new Error('Kullanici bulunamadi');
    error.status = 404;
    throw error;
  }
  return user;
}

async function updateProfile(userId, { full_name, email, profile_photo }) {
  full_name = toTitleCaseTR(full_name);
  const existing = await userRepository.findByEmail(email);
  if (existing && existing.id !== userId) {
    const error = new Error('Bu e-posta adresi zaten kayitli');
    error.status = 409;
    throw error;
  }

  await userRepository.updateOwnProfile(userId, { full_name, email, profile_photo });

  await activityLogService.log({
    actorId: userId,
    actionType: activityLogService.ACTION_TYPES.PROFILE_UPDATED,
    description: `Profil bilgileri guncellendi: ${full_name}`,
    targetUserId: userId,
  });

  return userRepository.findByIdDetailed(userId);
}

module.exports = { getProfile, updateProfile };
