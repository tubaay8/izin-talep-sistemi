const userRepository = require('../repositories/user.repository');
const passwordResetRepository = require('../repositories/passwordReset.repository');
const mailService = require('./mail.service');
const { hashPassword } = require('../utils/password');
const { generateResetToken, hashToken, TOKEN_TTL_MINUTES } = require('../utils/resetToken');

const GENERIC_MESSAGE = 'Eger bu e-posta sistemde kayitliysa sifirlama baglantisi gonderildi.';

async function requestReset(email) {
  const user = await userRepository.findByEmail(email);

  // Kullanici bulunamasa veya pasif olsa dahi ayni genel mesaj donulur;
  // boylece e-posta enumerasyonuna (kayitli mi degil mi) izin verilmez.
  if (!user || !user.is_active) {
    return { message: GENERIC_MESSAGE };
  }

  await passwordResetRepository.invalidatePendingForUser(user.id);

  const { rawToken, tokenHash } = generateResetToken();

  await passwordResetRepository.create({
    userId: user.id,
    tokenHash,
    ttlMinutes: TOKEN_TTL_MINUTES,
  });

  const resetUrl = `${process.env.APP_URL}/reset-password?token=${rawToken}`;

  try {
    await mailService.sendPasswordResetEmail({
      to: user.email,
      fullName: user.full_name,
      resetUrl,
    });
  } catch {
    const error = new Error('E-posta gonderilemedi, lutfen daha sonra tekrar deneyin');
    error.status = 502;
    throw error;
  }

  return { message: GENERIC_MESSAGE };
}

async function resetPassword(rawToken, newPassword) {
  const tokenHash = hashToken(rawToken);
  const record = await passwordResetRepository.findByTokenHash(tokenHash);

  if (!record) {
    const error = new Error('Gecersiz sifirlama baglantisi');
    error.status = 400;
    throw error;
  }

  if (record.used_at) {
    const error = new Error('Bu sifirlama baglantisi daha once kullanilmis');
    error.status = 400;
    throw error;
  }

  if (new Date(record.expires_at).getTime() < Date.now()) {
    const error = new Error('Sifirlama baglantisinin suresi dolmus, lutfen yeniden talep edin');
    error.status = 400;
    throw error;
  }

  const passwordHash = await hashPassword(newPassword);
  await userRepository.updatePasswordAndClearMustChange(record.user_id, passwordHash);
  await passwordResetRepository.markUsed(record.id);
}

module.exports = { requestReset, resetPassword };
