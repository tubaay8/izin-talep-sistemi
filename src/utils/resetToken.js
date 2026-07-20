const crypto = require('crypto');

const TOKEN_BYTES = 32;
const TOKEN_TTL_MINUTES = 15;

function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

function generateResetToken() {
  const rawToken = crypto.randomBytes(TOKEN_BYTES).toString('hex');
  return { rawToken, tokenHash: hashToken(rawToken) };
}

module.exports = { generateResetToken, hashToken, TOKEN_TTL_MINUTES };
