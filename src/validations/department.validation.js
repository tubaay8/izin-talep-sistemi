const { body } = require('express-validator');

const departmentValidation = [
  body('name').trim().notEmpty().withMessage('Departman adi zorunludur'),
  body('manager_id').optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage('Gecersiz yonetici'),
];

module.exports = { departmentValidation };
