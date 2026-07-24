jest.mock('../src/services/mail.service');

const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');
const mailService = require('../src/services/mail.service');
const { getRoleId, getDepartmentId, getLeaveTypeId, createUser, deleteUsers } = require('./setup/fixtures');

describe('Saatlik Izin', () => {
  let managerId;
  let employeeId;
  let adminId;
  let saatlikTypeId;
  const password = 'HourlyTest123!';

  beforeAll(async () => {
    mailService.trySend.mockImplementation((fn) => fn());

    const managerRoleId = await getRoleId('Yonetici');
    const personelRoleId = await getRoleId('Personel');
    const adminRoleId = await getRoleId('Admin');
    const departmentId = await getDepartmentId('Bilgi Islem');
    saatlikTypeId = await getLeaveTypeId('Saatlik İzin');

    managerId = await createUser({
      full_name: 'Hourly Test Yonetici',
      email: 'hourly-test-manager@example.com',
      password,
      role_id: managerRoleId,
      department_id: departmentId,
    });

    employeeId = await createUser({
      full_name: 'Hourly Test Personel',
      email: 'hourly-test-employee@example.com',
      password,
      role_id: personelRoleId,
      department_id: departmentId,
      manager_id: managerId,
    });

    adminId = await createUser({
      full_name: 'Hourly Test Admin',
      email: 'hourly-test-admin@example.com',
      password,
      role_id: adminRoleId,
      department_id: departmentId,
    });
  });

  afterAll(async () => {
    await deleteUsers([managerId, employeeId, adminId]);
    await pool.end();
  });

  async function loginAs(email) {
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({ email, password });
    return agent;
  }

  test('farkli gun secilirse reddedilir', async () => {
    const agent = await loginAs('hourly-test-employee@example.com');
    const res = await agent.post('/api/leave-requests').send({
      leave_type_id: saatlikTypeId,
      start_date: '2026-09-01',
      end_date: '2026-09-02',
      start_time: '09:00',
      end_time: '13:00',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/ayni gun/i);
  });

  test('bitis saati baslangictan once ise reddedilir', async () => {
    const agent = await loginAs('hourly-test-employee@example.com');
    const res = await agent.post('/api/leave-requests').send({
      leave_type_id: saatlikTypeId,
      start_date: '2026-09-01',
      end_date: '2026-09-01',
      start_time: '14:00',
      end_time: '13:00',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/sonra olmalidir/i);
  });

  test('saat bilgisi eksikse reddedilir', async () => {
    const agent = await loginAs('hourly-test-employee@example.com');
    const res = await agent.post('/api/leave-requests').send({
      leave_type_id: saatlikTypeId,
      start_date: '2026-09-01',
      end_date: '2026-09-01',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/zorunludur/i);
  });

  test('gecerli saatlik talep olusturulur', async () => {
    const agent = await loginAs('hourly-test-employee@example.com');
    const res = await agent.post('/api/leave-requests').send({
      leave_type_id: saatlikTypeId,
      start_date: '2026-09-01',
      end_date: '2026-09-01',
      start_time: '09:00',
      end_time: '13:00',
      reason: '4 saatlik test',
    });

    expect(res.status).toBe(201);
    expect(res.body.request.status).toBe('pending');
    expect(res.body.request.start_time).toBe('09:00:00');
    expect(res.body.request.end_time).toBe('13:00:00');
  });

  test('9 saate ulasan onayli saatlik izinler bakiyeden 1 gun duser', async () => {
    const employeeAgent = await loginAs('hourly-test-employee@example.com');
    const adminAgent = await loginAs('hourly-test-admin@example.com');

    const req1 = await employeeAgent.post('/api/leave-requests').send({
      leave_type_id: saatlikTypeId,
      start_date: '2026-09-10',
      end_date: '2026-09-10',
      start_time: '09:00',
      end_time: '13:00', // 4 saat
    });
    await adminAgent.patch(`/api/admin/leave-requests/${req1.body.request.id}/status`).send({ status: 'approved' });

    const midStats = await employeeAgent.get('/api/stats');
    expect(midStats.body.leaveBalance.usedDays).toBe(0);
    expect(midStats.body.leaveBalance.pendingHours).toBe(4);

    const req2 = await employeeAgent.post('/api/leave-requests').send({
      leave_type_id: saatlikTypeId,
      start_date: '2026-09-11',
      end_date: '2026-09-11',
      start_time: '09:00',
      end_time: '14:00', // 5 saat -> toplam 9 saat
    });
    await adminAgent.patch(`/api/admin/leave-requests/${req2.body.request.id}/status`).send({ status: 'approved' });

    const finalStats = await employeeAgent.get('/api/stats');
    expect(finalStats.body.leaveBalance.usedDays).toBe(1);
    expect(finalStats.body.leaveBalance.pendingHours).toBe(0);

    // Reddedilince bakiye geri gelmeli
    await adminAgent
      .patch(`/api/admin/leave-requests/${req2.body.request.id}/status`)
      .send({ status: 'rejected', approval_note: 'test geri alma' });

    const revertedStats = await employeeAgent.get('/api/stats');
    expect(revertedStats.body.leaveBalance.usedDays).toBe(0);
    expect(revertedStats.body.leaveBalance.pendingHours).toBe(4);
  });
});
