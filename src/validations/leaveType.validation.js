const { body } = require('express-validator');

const leaveTypeValidation = [
  body('name').trim().notEmpty().withMessage('Izin turu adi zorunludur'),
  body('description').optional({ checkFalsy: true }).isLength({ max: 255 }).withMessage('Aciklama en fazla 255 karakter olabilir'),
];

module.exports = { leaveTypeValidation };
