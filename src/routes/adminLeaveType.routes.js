const express = require('express');
const leaveTypeController = require('../controllers/leaveType.controller');
const { leaveTypeValidation } = require('../validations/leaveType.validation');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

router.post('/', leaveTypeValidation, validate, leaveTypeController.create);
router.put('/:id', leaveTypeValidation, validate, leaveTypeController.update);
router.delete('/:id', leaveTypeController.remove);

module.exports = router;
