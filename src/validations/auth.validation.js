const { body } = require('express-validator');

const registerValidation = [
  body('full_name').trim().notEmpty().withMessage('Ad soyad zorunludur'),
  body('email').trim().isEmail().withMessage('Gecerli bir e-posta giriniz').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Sifre en az 6 karakter olmalidir'),
  body('department_id').isInt({ min: 1 }).withMessage('Departman seciniz'),
  body('manager_id').optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage('Gecersiz yonetici'),
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Gecerli bir e-posta giriniz').normalizeEmail(),
  body('password').notEmpty().withMessage('Sifre zorunludur'),
];

module.exports = { registerValidation, loginValidation };
