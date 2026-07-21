const app = require('./app');
const mailService = require('./services/mail.service');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde calisiyor`);
});

// SMTP baglantisi sunucu acilisinda bir kez dogrulanir; kimlik bilgileri
// hicbir zaman loglanmaz, yalnizca basari/hata durumu yazilir.
mailService
  .verifyConnection()
  .then(() => console.log('SMTP baglantisi dogrulandi'))
  .catch(() => console.warn('SMTP baglantisi dogrulanamadi, e-posta gonderimi calismayabilir'));
