jest.mock('../src/services/mail.service');

const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');
const { getRoleId, getDepartmentId, createUser, deleteUsers } = require('./setup/fixtures');

describe('Departman yoneticisi kendi departmanindan olmali', () => {
  let adminId;
  let hrDepartmentId;
  let itDepartmentId;
  let hrManagerId;
  let itManagerId;
  const password = 'DeptMgrTest123!';

  beforeAll(async () => {
    const adminRoleId = await getRoleId('Admin');
    const managerRoleId = await getRoleId('Yonetici');
    hrDepartmentId = await getDepartmentId('Insan Kaynaklari');
    itDepartmentId = await getDepartmentId('Bilgi Islem');

    adminId = await createUser({
      full_name: 'Dept Mgr Test Admin',
      email: 'dept-mgr-test-admin@example.com',
      password,
      role_id: adminRoleId,
      department_id: itDepartmentId,
    });

    hrManagerId = await createUser({
      full_name: 'Dept Mgr Test IK Yoneticisi',
      email: 'dept-mgr-test-hr-manager@example.com',
      password,
      role_id: managerRoleId,
      department_id: hrDepartmentId,
    });

    itManagerId = await createUser({
      full_name: 'Dept Mgr Test BI Yoneticisi',
      email: 'dept-mgr-test-it-manager@example.com',
      password,
      role_id: managerRoleId,
      department_id: itDepartmentId,
    });
  });

  afterAll(async () => {
    await deleteUsers([adminId, hrManagerId, itManagerId]);
    await pool.end();
  });

  async function loginAsAdmin() {
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({ email: 'dept-mgr-test-admin@example.com', password });
    return agent;
  }

  test('baska departmandan bir yonetici atanamaz', async () => {
    const agent = await loginAsAdmin();
    const res = await agent.put(`/api/admin/departments/${itDepartmentId}`).send({
      name: 'Bilgi Islem',
      manager_id: hrManagerId, // IK'da, Bilgi Islem'de degil
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/kendi uyesi olmali/i);
  });

  test('ayni departmandan bir yonetici atanabilir', async () => {
    const agent = await loginAsAdmin();
    const res = await agent.put(`/api/admin/departments/${itDepartmentId}`).send({
      name: 'Bilgi Islem',
      manager_id: itManagerId, // Bilgi Islem'in kendi uyesi
    });

    expect(res.status).toBe(200);
    expect(res.body.department.manager_id).toBe(itManagerId);

    // Temizlik: departmani eski (yoneticisiz) haline dondur
    await agent.put(`/api/admin/departments/${itDepartmentId}`).send({ name: 'Bilgi Islem', manager_id: null });
  });

  test('yeni departman olustururken yonetici atanamaz (henuz kimse o departmanda degil)', async () => {
    const agent = await loginAsAdmin();
    const name = `Test Yeni Departman ${Date.now()}`;
    const res = await agent.post('/api/admin/departments').send({ name, manager_id: itManagerId });

    expect(res.status).toBe(400);

    await pool.query('DELETE FROM departments WHERE name = ?', [name]);
  });
});
