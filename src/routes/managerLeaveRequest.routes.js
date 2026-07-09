const express = require('express');
const managerLeaveRequestController = require('../controllers/managerLeaveRequest.controller');
const { decisionValidation } = require('../validations/managerDecision.validation');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

router.get('/', managerLeaveRequestController.listTeamRequests);
router.patch('/:id/decision', decisionValidation, validate, managerLeaveRequestController.decide);

module.exports = router;
