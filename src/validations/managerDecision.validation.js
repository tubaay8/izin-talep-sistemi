const { body } = require('express-validator');

const decisionValidation = [
  body('decision').isIn(['approved', 'rejected']).withMessage('Karar approved veya rejected olmalidir'),
  body('approval_note').optional({ checkFalsy: true }).isLength({ max: 500 }).withMessage('Aciklama en fazla 500 karakter olabilir'),
];

const bulkDecisionValidation = [
  body('ids').isArray({ min: 1 }).withMessage('En az bir izin talebi seciniz'),
  body('ids.*').isInt({ min: 1 }).withMessage('Gecersiz izin talebi'),
  body('decision').isIn(['approved', 'rejected']).withMessage('Karar approved veya rejected olmalidir'),
  body('approval_note').optional({ checkFalsy: true }).isLength({ max: 500 }).withMessage('Aciklama en fazla 500 karakter olabilir'),
];

module.exports = { decisionValidation, bulkDecisionValidation };
