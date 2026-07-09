const leaveRequestRepository = require('../repositories/leaveRequest.repository');
const userRepository = require('../repositories/user.repository');

async function getLeaveRequestForPdf(id, user) {
  const request = await leaveRequestRepository.findByIdForAdmin(id);
  if (!request) {
    const error = new Error('Izin talebi bulunamadi');
    error.status = 404;
    throw error;
  }

  if (user.role_name === 'Personel') {
    if (request.user_id !== user.id) {
      const error = new Error('Bu form uzerinde yetkiniz yok');
      error.status = 403;
      throw error;
    }
  } else if (user.role_name === 'Yonetici') {
    const employee = await userRepository.findById(request.user_id);
    if (!employee || employee.manager_id !== user.id) {
      const error = new Error('Bu form uzerinde yetkiniz yok');
      error.status = 403;
      throw error;
    }
  }
  // Admin: kisitlama yok, tum formlari indirebilir.

  return request;
}

module.exports = { getLeaveRequestForPdf };
