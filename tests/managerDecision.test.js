jest.mock('../src/services/mail.service');

const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');
const mailService = require('../src/services/mail.service');
const { getRoleId, getDepartmentId, getLeaveTypeId, createUser, deleteUsers } = require('./setup/fixtures');

describe('Manager / Admin karar akisi', () => {
  let managerId;
  let otherManagerId;
  let employeeId;
  let adminId;
  let mazeretTypeId;
  const password = 'DecisionTest123!';

  beforeAll(async () => {
    // trySend'in gercek gonderimi tetikleyen fonksiyonu cagirmasini sagliyoruz,
    // aksi halde mock'lanmis trySend hicbir zaman sendXxx'i cagirmaz.
    mailService.trySend.mockImplementation((fn) => fn());

    const managerRoleId = await getRoleId('Yonetici');
    const personelRoleId = await getRoleId('Personel');
    const adminRoleId = await getRoleId('Admin');
    const departmentId = await getDepartmentId('Bilgi Islem');
    mazeretTypeId = await getLeaveTypeId('Mazeret İzni');

    managerId = await createUser({
      full_name: 'Decision Test Yonetici',
      email: 'decision-test-manager@example.com',
      password,
      role_id: managerRoleId,
      department_id: departmentId,
    });

    otherManagerId = await createUser({
      full_name: 'Decision Test Diger Yonetici',
      email: 'decision-test-other-manager@example.com',
      password,
      role_id: managerRoleId,
      department_id: departmentId,
    });

    employeeId = await createUser({
      full_name: 'Decision Test Personel',
      email: 'decision-test-employee@example.com',
      password,
      role_id: personelRoleId,
      department_id: departmentId,
      manager_id: managerId,
    });

    adminId = await createUser({
      full_name: 'Decision Test Admin',
      email: 'decision-test-admin@example.com',
      password,
      role_id: adminRoleId,
      department_id: departmentId,
    });
  });

  afterAll(async () => {
    await deleteUsers([managerId, otherManagerId, employeeId, adminId]);
    await pool.end();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  async function loginAs(email) {
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({ email, password });
    return agent;
  }

  async function createPendingRequest() {
    const employeeAgent = await loginAs('decision-test-employee@example.com');
    const res = await employeeAgent.post('/api/leave-requests').send({
      leave_type_id: mazeretTypeId,
      start_date: '2026-11-01',
      end_date: '2026-11-02',
      reason: 'Karar testi',
    });
    return res.body.request.id;
  }

  test('yonetici kendi personelinin talebini onaylayabilir ve mail gonderilir', async () => {
    const requestId = await createPendingRequest();
    const managerAgent = await loginAs('decision-test-manager@example.com');

    const res = await managerAgent.patch(`/api/manager/leave-requests/${requestId}/decision`).send({
      decision: 'approved',
    });

    expect(res.status).toBe(200);
    expect(res.body.request.status).toBe('approved');
    expect(mailService.sendLeaveRequestApprovedEmail).toHaveBeenCalledTimes(1);
  });

  test('yonetici gerekce ile reddedebilir, gerekce maile tasinir', async () => {
    const requestId = await createPendingRequest();
    const managerAgent = await loginAs('decision-test-manager@example.com');

    const res = await managerAgent.patch(`/api/manager/leave-requests/${requestId}/decision`).send({
      decision: 'rejected',
      approval_note: 'Bu donemde uygun degil',
    });

    expect(res.status).toBe(200);
    expect(res.body.request.status).toBe('rejected');
    expect(mailService.sendLeaveRequestRejectedEmail).toHaveBeenCalledWith(
      expect.objectContaining({ reason: 'Bu donemde uygun degil' })
    );
  });

  test('baska yoneticinin personeli uzerinde karar verilemez (403)', async () => {
    const requestId = await createPendingRequest();
    const otherManagerAgent = await loginAs('decision-test-other-manager@example.com');

    const res = await otherManagerAgent.patch(`/api/manager/leave-requests/${requestId}/decision`).send({
      decision: 'approved',
    });

    expect(res.status).toBe(403);
  });

  test('zaten karara baglanmis talep tekrar karara baglanamaz (409)', async () => {
    const requestId = await createPendingRequest();
    const managerAgent = await loginAs('decision-test-manager@example.com');

    await managerAgent.patch(`/api/manager/leave-requests/${requestId}/decision`).send({ decision: 'approved' });
    const secondRes = await managerAgent
      .patch(`/api/manager/leave-requests/${requestId}/decision`)
      .send({ decision: 'rejected', approval_note: 'gec kaldim' });

    expect(secondRes.status).toBe(409);
  });

  test('admin dogrudan onaylayabilir', async () => {
    const requestId = await createPendingRequest();
    const adminAgent = await loginAs('decision-test-admin@example.com');

    const res = await adminAgent.patch(`/api/admin/leave-requests/${requestId}/status`).send({
      status: 'approved',
    });

    expect(res.status).toBe(200);
    expect(mailService.sendLeaveRequestApprovedEmail).toHaveBeenCalledTimes(1);
  });

  test('yonetici admin uc noktasina erisemez (403)', async () => {
    const managerAgent = await loginAs('decision-test-manager@example.com');
    const res = await managerAgent.get('/api/admin/users');
    expect(res.status).toBe(403);
  });

  test('personel yonetici uc noktasina erisemez (403)', async () => {
    const employeeAgent = await loginAs('decision-test-employee@example.com');
    const res = await employeeAgent.get('/api/manager/leave-requests');
    expect(res.status).toBe(403);
  });
});
