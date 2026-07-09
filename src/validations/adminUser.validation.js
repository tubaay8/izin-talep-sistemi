const { body } = require('express-validator');

const createUserValidation = [
  body('full_name').trim().notEmpty().withMessage('Ad soyad zorunludur'),
  body('email').trim().isEmail().withMessage('Gecerli bir e-posta giriniz').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Sifre en az 6 karakter olmalidir'),
  body('role_id').isInt({ min: 1 }).withMessage('Rol seciniz'),
  body('department_id').isInt({ min: 1 }).withMessage('Departman seciniz'),
  body('manager_id').optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage('Gecersiz yonetici'),
];

const updateUserValidation = [
  body('full_name').trim().notEmpty().withMessage('Ad soyad zorunludur'),
  body('email').trim().isEmail().withMessage('Gecerli bir e-posta giriniz').normalizeEmail(),
  body('password').optional({ checkFalsy: true }).isLength({ min: 6 }).withMessage('Sifre en az 6 karakter olmalidir'),
  body('role_id').isInt({ min: 1 }).withMessage('Rol seciniz'),
  body('department_id').isInt({ min: 1 }).withMessage('Departman seciniz'),
  body('manager_id').optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage('Gecersiz yonetici'),
  body('is_active').isBoolean().withMessage('Aktiflik durumu gecersiz'),
];

module.exports = { createUserValidation, updateUserValidation };
