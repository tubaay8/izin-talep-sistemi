const { body } = require('express-validator');

const updateValidation = [
  body('leave_type_id').isInt({ min: 1 }).withMessage('Izin turu seciniz'),
  body('start_date').isISO8601().withMessage('Gecerli bir baslangic tarihi giriniz'),
  body('end_date').isISO8601().withMessage('Gecerli bir bitis tarihi giriniz'),
  body('start_time').optional({ checkFalsy: true }).matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Gecerli bir baslangic saati giriniz (SS:DD)'),
  body('end_time').optional({ checkFalsy: true }).matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Gecerli bir bitis saati giriniz (SS:DD)'),
  body('reason').optional({ checkFalsy: true }).isLength({ max: 500 }).withMessage('Aciklama en fazla 500 karakter olabilir'),
];

const statusValidation = [
  body('status').isIn(['pending', 'approved', 'rejected', 'cancelled']).withMessage('Gecersiz durum'),
  body('approval_note').optional({ checkFalsy: true }).isLength({ max: 500 }).withMessage('Aciklama en fazla 500 karakter olabilir'),
];

const bulkStatusValidation = [
  body('ids').isArray({ min: 1 }).withMessage('En az bir izin talebi seciniz'),
  body('ids.*').isInt({ min: 1 }).withMessage('Gecersiz izin talebi'),
  body('status').isIn(['approved', 'rejected']).withMessage('Gecersiz durum'),
  body('approval_note').optional({ checkFalsy: true }).isLength({ max: 500 }).withMessage('Aciklama en fazla 500 karakter olabilir'),
];

module.exports = { updateValidation, statusValidation, bulkStatusValidation };
