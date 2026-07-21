require('dotenv').config();

const BASE_DB_NAME = process.env.DB_NAME || 'izin_talep_sistemi_node';

module.exports = `${BASE_DB_NAME}_test`;
