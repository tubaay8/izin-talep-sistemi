const { body } = require('express-validator');

const updateProfileValidation = [
  body('full_name').trim().notEmpty().withMessage('Ad soyad zorunludur'),
  body('email').trim().isEmail().withMessage('Gecerli bir e-posta giriniz').normalizeEmail(),
];

module.exports = { updateProfileValidation };
