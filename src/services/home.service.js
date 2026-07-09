const homeRepository = require('../repositories/home.repository');

async function getSystemStatus() {
  const dbConnected = await homeRepository.checkConnection();
  return {
    app: 'Izin Talep Sistemi',
    dbConnected,
  };
}

module.exports = { getSystemStatus };
