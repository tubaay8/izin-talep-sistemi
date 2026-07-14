const express = require('express');
const adminLeaveRequestController = require('../controllers/adminLeaveRequest.controller');
const { updateValidation, statusValidation } = require('../validations/adminLeaveRequest.validation');
const validate = require('../middlewares/validate.middleware');
const { reportUpload, handleUploadError } = require('../middlewares/reportUpload.middleware');

const router = express.Router();

router.get('/', adminLeaveRequestController.list);
router.get('/calendar', adminLeaveRequestController.calendar);
router.get('/:id', adminLeaveRequestController.getOne);
router.put(
  '/:id',
  reportUpload.single('report_file'),
  handleUploadError,
  updateValidation,
  validate,
  adminLeaveRequestController.update
);
router.patch('/:id/status', statusValidation, validate, adminLeaveRequestController.updateStatus);

module.exports = router;
