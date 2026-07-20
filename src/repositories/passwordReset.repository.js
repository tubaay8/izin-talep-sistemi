const pool = require('../config/db');

async function create({ userId, tokenHash, ttlMinutes }) {
  // Suresi MySQL sunucusunda NOW() uzerinden hesaplanir; Node ile DB
  // sunucusu arasinda saat dilimi/saat farki olsa bile created_at ile
  // expires_at ayni referans saate gore tutarli kalir.
  await pool.query(
    'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))',
    [userId, tokenHash, ttlMinutes]
  );
}

async function findByTokenHash(tokenHash) {
  const [rows] = await pool.query(
    'SELECT * FROM password_reset_tokens WHERE token_hash = ? LIMIT 1',
    [tokenHash]
  );
  return rows[0] || null;
}

async function markUsed(id) {
  await pool.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?', [id]);
}

async function invalidatePendingForUser(userId) {
  await pool.query(
    'UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL',
    [userId]
  );
}

module.exports = { create, findByTokenHash, markUsed, invalidatePendingForUser };
