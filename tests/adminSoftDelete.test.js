jest.mock('../src/services/mail.service');

const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');
const { getRoleId, getDepartmentId, createUser, deleteUsers } = require('./setup/fixtures');

describe('Departman / Izin turu "silme" aslinda pasife alir', () => {
  let adminId;
  const password = 'SoftDeleteTest123!';

  beforeAll(async () => {
    const adminRoleId = await getRoleId('Admin');
    const departmentId = await getDepartmentId('Bilgi Islem');

    adminId = await createUser({
      full_name: 'Soft Delete Test Admin',
      email: 'soft-delete-test-admin@example.com',
      password,
      role_id: adminRoleId,
      department_id: departmentId,
    });
  });

  afterAll(async () => {
    await deleteUsers([adminId]);
    await pool.end();
  });

  async function loginAsAdmin() {
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({ email: 'soft-delete-test-admin@example.com', password });
    return agent;
  }

  test('silinen departman aktif listeden duser ama veritabaninda kalir (ayni isimle tekrar olusturma cakisir)', async () => {
    const agent = await loginAsAdmin();
    const name = `Test Soft Delete Departman ${Date.now()}`;

    const createRes = await agent.post('/api/admin/departments').send({ name });
    expect(createRes.status).toBe(201);
    const id = createRes.body.department.id;

    const deleteRes = await agent.delete(`/api/admin/departments/${id}`);
    expect(deleteRes.status).toBe(200);

    const listRes = await agent.get('/api/departments');
    expect(listRes.body.departments.some((d) => d.id === id)).toBe(false);

    // Satir gercekten silinmis olsaydi bu ikinci create basariyla gecerdi;
    // unique constraint hala tetikleniyorsa satir veritabaninda demektir.
    const recreateRes = await agent.post('/api/admin/departments').send({ name });
    expect(recreateRes.status).toBe(409);

    await pool.query('DELETE FROM departments WHERE id = ?', [id]);
  });

  test('silinen izin turu aktif listeden duser ama veritabaninda kalir ve yeni talepte kullanilamaz', async () => {
    const agent = await loginAsAdmin();
    const name = `Test Soft Delete Izin Turu ${Date.now()}`;

    const createRes = await agent.post('/api/admin/leave-types').send({ name });
    expect(createRes.status).toBe(201);
    const id = createRes.body.leaveType.id;

    const deleteRes = await agent.delete(`/api/admin/leave-types/${id}`);
    expect(deleteRes.status).toBe(200);

    const listRes = await agent.get('/api/leave-types');
    expect(listRes.body.leaveTypes.some((t) => t.id === id)).toBe(false);

    const recreateRes = await agent.post('/api/admin/leave-types').send({ name });
    expect(recreateRes.status).toBe(409);

    // Pasif turle yeni izin talebi olusturulamamali
    const requestRes = await agent.post('/api/leave-requests').send({
      leave_type_id: id,
      start_date: '2026-09-01',
      end_date: '2026-09-01',
      reason: 'pasif tur testi',
    });
    expect(requestRes.status).toBe(400);
    expect(requestRes.body.message).toMatch(/gecersiz izin turu/i);

    await pool.query('DELETE FROM leave_types WHERE id = ?', [id]);
  });
});
