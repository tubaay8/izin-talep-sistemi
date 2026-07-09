const { body } = require('express-validator');

const updateValidation = [
  body('leave_type_id').isInt({ min: 1 }).withMessage('Izin turu seciniz'),
  body('start_date').isISO8601().withMessage('Gecerli bir baslangic tarihi giriniz'),
  body('end_date').isISO8601().withMessage('Gecerli bir bitis tarihi giriniz'),
  body('reason').optional({ checkFalsy: true }).isLength({ max: 500 }).withMessage('Aciklama en fazla 500 karakter olabilir'),
];

const statusValidation = [
  body('status').isIn(['pending', 'approved', 'rejected', 'cancelled']).withMessage('Gecersiz durum'),
  body('approval_note').optional({ checkFalsy: true }).isLength({ max: 500 }).withMessage('Aciklama en fazla 500 karakter olabilir'),
];

module.exports = { updateValidation, statusValidation };
