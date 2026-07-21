// Jest "setupFiles" olarak calisir: test dosyalari src/app.js'i (dolayisiyla
// src/config/db.js'i) require etmeden ONCE calisir, boylece uygulama gercek
// gelistirme veritabani yerine ayri bir test veritabanina baglanir.
require('dotenv').config();

process.env.DB_NAME = require('./testDbName');
process.env.NODE_ENV = 'test';
