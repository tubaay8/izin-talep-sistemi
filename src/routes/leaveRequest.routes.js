const express = require('express');
const leaveRequestController = require('../controllers/leaveRequest.controller');
const { leaveRequestValidation } = require('../validations/leaveRequest.validation');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

router.get('/', leaveRequestController.listMine);
router.get('/:id/pdf', leaveRequestController.downloadPdf);
router.get('/:id', leaveRequestController.getOne);
router.post('/', leaveRequestValidation, validate, leaveRequestController.create);
router.put('/:id', leaveRequestValidation, validate, leaveRequestController.update);
router.patch('/:id/cancel', leaveRequestController.cancel);

module.exports = router;
