const bcrypt = require('bcrypt');
const crypto = require('crypto');

const SALT_ROUNDS = 10;

// Karisiklik yaratabilecek harfler/rakamlar (I, l, 1, O, 0) haric tutulur.
const TEMP_PASSWORD_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
const TEMP_PASSWORD_LENGTH = 10;

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

function generateTemporaryPassword() {
  let password = '';
  for (let i = 0; i < TEMP_PASSWORD_LENGTH; i += 1) {
    password += TEMP_PASSWORD_CHARS[crypto.randomInt(TEMP_PASSWORD_CHARS.length)];
  }
  return password;
}

module.exports = { hashPassword, generateTemporaryPassword };
