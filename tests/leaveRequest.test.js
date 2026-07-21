jest.mock('../src/services/mail.service');

const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');
const { getRoleId, getDepartmentId, getLeaveTypeId, createUser, deleteUsers } = require('./setup/fixtures');

describe('Leave Request API', () => {
  let managerId;
  let employeeId;
  let mazeretTypeId;
  let yillikTypeId;
  const password = 'LeaveTest123!';

  beforeAll(async () => {
    const managerRoleId = await getRoleId('Yonetici');
    const personelRoleId = await getRoleId('Personel');
    const departmentId = await getDepartmentId('Bilgi Islem');
    mazeretTypeId = await getLeaveTypeId('Mazeret İzni');
    yillikTypeId = await getLeaveTypeId('Yıllık İzin');

    managerId = await createUser({
      full_name: 'Leave Test Yonetici',
      email: 'leave-test-manager@example.com',
      password,
      role_id: managerRoleId,
      department_id: departmentId,
    });

    employeeId = await createUser({
      full_name: 'Leave Test Personel',
      email: 'leave-test-employee@example.com',
      password,
      role_id: personelRoleId,
      department_id: departmentId,
      manager_id: managerId,
    });
  });

  afterAll(async () => {
    await deleteUsers([managerId, employeeId]);
    await pool.end();
  });

  async function loginAsEmployee() {
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({ email: 'leave-test-employee@example.com', password });
    return agent;
  }

  test('gerekli alan eksikse validation hatasi doner', async () => {
    const agent = await loginAsEmployee();
    const res = await agent.post('/api/leave-requests').send({ start_date: '2026-10-01', end_date: '2026-10-02' });

    expect(res.status).toBe(400);
    expect(res.body.errors.some((e) => e.path === 'leave_type_id')).toBe(true);
  });

  test('yeterli bakiye yoksa talep reddedilir', async () => {
    const agent = await loginAsEmployee();
    const res = await agent.post('/api/leave-requests').send({
      leave_type_id: yillikTypeId, // counts_toward_quota = 1, varsayilan bakiye 14 gun
      start_date: '2026-01-01',
      end_date: '2026-01-31', // 31 gun > 14 gun
      reason: 'Cok uzun izin',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/bakiye/i);
  });

  test('gecerli talep basariyla olusturulur ve durumu bekliyor olur', async () => {
    const agent = await loginAsEmployee();
    const res = await agent.post('/api/leave-requests').send({
      leave_type_id: mazeretTypeId, // kotaya sayilmiyor, bakiye kontrolu devreye girmez
      start_date: '2026-10-01',
      end_date: '2026-10-02',
      reason: 'Test talebi',
    });

    expect(res.status).toBe(201);
    expect(res.body.request.status).toBe('pending');
    expect(res.body.request.user_id).toBe(employeeId);
  });

  test('olusturulan talep kendi listemde gorunur', async () => {
    const agent = await loginAsEmployee();
    await agent.post('/api/leave-requests').send({
      leave_type_id: mazeretTypeId,
      start_date: '2026-10-05',
      end_date: '2026-10-06',
      reason: 'Listede gorunme testi',
    });

    const res = await agent.get('/api/leave-requests');
    expect(res.status).toBe(200);
    expect(res.body.requests.some((r) => r.reason === 'Listede gorunme testi')).toBe(true);
  });

  test('bekleyen talep duzenlenebilir', async () => {
    const agent = await loginAsEmployee();
    const createRes = await agent.post('/api/leave-requests').send({
      leave_type_id: mazeretTypeId,
      start_date: '2026-10-10',
      end_date: '2026-10-11',
      reason: 'Duzenlenecek talep',
    });
    const id = createRes.body.request.id;

    const updateRes = await agent.put(`/api/leave-requests/${id}`).send({
      leave_type_id: mazeretTypeId,
      start_date: '2026-10-12',
      end_date: '2026-10-13',
      reason: 'Guncellendi',
    });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.request.reason).toBe('Guncellendi');
  });

  test('bekleyen talep iptal edilebilir, ayni talep tekrar iptal edilemez', async () => {
    const agent = await loginAsEmployee();
    const createRes = await agent.post('/api/leave-requests').send({
      leave_type_id: mazeretTypeId,
      start_date: '2026-10-20',
      end_date: '2026-10-21',
      reason: 'Iptal edilecek talep',
    });
    const id = createRes.body.request.id;

    const cancelRes = await agent.patch(`/api/leave-requests/${id}/cancel`);
    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.request.status).toBe('cancelled');

    const secondCancelRes = await agent.patch(`/api/leave-requests/${id}/cancel`);
    expect(secondCancelRes.status).toBe(409);
  });

  test('oturum olmadan istek atilamaz', async () => {
    const res = await request(app).get('/api/leave-requests');
    expect(res.status).toBe(401);
  });
});
