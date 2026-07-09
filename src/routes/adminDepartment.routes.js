const express = require('express');
const departmentController = require('../controllers/department.controller');
const { departmentValidation } = require('../validations/department.validation');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

router.post('/', departmentValidation, validate, departmentController.create);
router.put('/:id', departmentValidation, validate, departmentController.update);
router.delete('/:id', departmentController.remove);

module.exports = router;
