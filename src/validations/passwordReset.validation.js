const { body } = require('express-validator');

const forgotPasswordValidation = [
  body('email').trim().isEmail().withMessage('Gecerli bir e-posta giriniz').normalizeEmail(),
];

const resetPasswordValidation = [
  body('token').trim().notEmpty().withMessage('Gecersiz sifirlama baglantisi'),
  body('new_password').isLength({ min: 6 }).withMessage('Sifre en az 6 karakter olmalidir'),
];

module.exports = { forgotPasswordValidation, resetPasswordValidation };
