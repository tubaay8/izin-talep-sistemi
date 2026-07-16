const express = require('express');
const leaveRequestController = require('../controllers/leaveRequest.controller');
const { leaveRequestValidation } = require('../validations/leaveRequest.validation');
const validate = require('../middlewares/validate.middleware');
const { reportUpload, handleUploadError } = require('../middlewares/reportUpload.middleware');

const router = express.Router();

router.get('/', leaveRequestController.listMine);
router.get('/conflicts', leaveRequestController.getConflicts);
router.get('/delegate-candidates', leaveRequestController.getDelegateCandidates);
router.get('/:id/pdf', leaveRequestController.downloadPdf);
router.get('/:id/report', leaveRequestController.downloadReport);
router.get('/:id', leaveRequestController.getOne);
router.post(
  '/',
  reportUpload.single('report_file'),
  handleUploadError,
  leaveRequestValidation,
  validate,
  leaveRequestController.create
);
router.put(
  '/:id',
  reportUpload.single('report_file'),
  handleUploadError,
  leaveRequestValidation,
  validate,
  leaveRequestController.update
);
router.patch('/:id/cancel', leaveRequestController.cancel);

module.exports = router;
