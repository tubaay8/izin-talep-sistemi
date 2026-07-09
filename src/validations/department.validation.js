const { body } = require('express-validator');

const departmentValidation = [body('name').trim().notEmpty().withMessage('Departman adi zorunludur')];

module.exports = { departmentValidation };
