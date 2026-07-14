const { body } = require('express-validator');

const loginValidation = [
  body('email').trim().isEmail().withMessage('Gecerli bir e-posta giriniz').normalizeEmail(),
  body('password').notEmpty().withMessage('Sifre zorunludur'),
];

const changePasswordValidation = [
  body('new_password').isLength({ min: 6 }).withMessage('Sifre en az 6 karakter olmalidir'),
];

module.exports = { loginValidation, changePasswordValidation };
