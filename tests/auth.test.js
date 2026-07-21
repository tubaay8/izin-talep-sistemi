jest.mock('../src/services/mail.service');

const crypto = require('crypto');
const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');
const mailService = require('../src/services/mail.service');
const { getRoleId, getDepartmentId, createUser, deleteUsers } = require('./setup/fixtures');

describe('Auth API', () => {
  let personelId;
  let inactiveId;
  const password = 'AuthTest123!';

  beforeAll(async () => {
    // mail.service tamamen mock'landigi icin trySend'in gercek gonderimi
    // tetikleyen ic fonksiyonu cagirmasini sagliyoruz (yoksa sendXxx hicbir
    // zaman cagrilmaz, mock kendi kendine no-op kalir).
    mailService.trySend.mockImplementation((fn) => fn());

    const roleId = await getRoleId('Personel');
    const departmentId = await getDepartmentId('Bilgi Islem');

    personelId = await createUser({
      full_name: 'Auth Test Personel',
      email: 'auth-test-personel@example.com',
      password,
      role_id: roleId,
      department_id: departmentId,
    });

    inactiveId = await createUser({
      full_name: 'Auth Test Pasif',
      email: 'auth-test-pasif@example.com',
      password,
      role_id: roleId,
      department_id: departmentId,
      is_active: 0,
    });
  });

  afterAll(async () => {
    await deleteUsers([personelId, inactiveId]);
    await pool.end();
  });

  describe('POST /api/auth/login', () => {
    test('gecerli bilgilerle giris basarili olur', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'auth-test-personel@example.com', password });

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('auth-test-personel@example.com');
      expect(res.body.user.password).toBeUndefined();
    });

    test('yanlis sifreyle giris 401 doner', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'auth-test-personel@example.com', password: 'yanlis-sifre' });

      expect(res.status).toBe(401);
    });

    test('pasif kullanici giris yapamaz', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'auth-test-pasif@example.com', password });

      expect(res.status).toBe(401);
    });

    test('gecersiz e-posta formati validation hatasi doner', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'gecersiz-email', password: '123' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    test('kayitli e-posta icin genel mesaj doner ve mail gonderilir', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'auth-test-personel@example.com' });

      expect(res.status).toBe(200);
      expect(mailService.sendPasswordResetEmail).toHaveBeenCalledTimes(1);

      const [rows] = await pool.query('SELECT * FROM password_reset_tokens WHERE user_id = ?', [personelId]);
      expect(rows).toHaveLength(1);
    });

    test('kayitli olmayan e-posta icin de AYNI genel mesaj doner (enumeration engeli)', async () => {
      const known = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'auth-test-personel@example.com' });
      const unknown = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'hic-kayitli-olmayan@example.com' });

      expect(unknown.status).toBe(200);
      expect(unknown.body.message).toBe(known.body.message);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    async function insertToken({ userId, expiresInMinutes, usedAt = null }) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      await pool.query(
        `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at, used_at)
         VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE), ?)`,
        [userId, tokenHash, expiresInMinutes, usedAt]
      );
      return rawToken;
    }

    test('gecersiz token reddedilir', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'olmayan-bir-token', new_password: 'YeniSifre123!' });

      expect(res.status).toBe(400);
    });

    test('suresi dolmus token reddedilir', async () => {
      const token = await insertToken({ userId: personelId, expiresInMinutes: -5 });
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ token, new_password: 'YeniSifre123!' });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/suresi dolmus/i);
    });

    test('daha once kullanilmis token reddedilir', async () => {
      const token = await insertToken({ userId: personelId, expiresInMinutes: 15, usedAt: new Date() });
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ token, new_password: 'YeniSifre123!' });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/kullanilmis/i);
    });

    test('gecerli token ile sifre guncellenir ve yeni sifreyle giris yapilabilir', async () => {
      const token = await insertToken({ userId: personelId, expiresInMinutes: 15 });
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ token, new_password: 'YeniSifre123!' });

      expect(res.status).toBe(200);

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'auth-test-personel@example.com', password: 'YeniSifre123!' });

      expect(loginRes.status).toBe(200);
    });
  });
});
