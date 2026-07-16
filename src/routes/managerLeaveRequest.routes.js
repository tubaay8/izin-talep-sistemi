const express = require('express');
const managerLeaveRequestController = require('../controllers/managerLeaveRequest.controller');
const { decisionValidation, bulkDecisionValidation } = require('../validations/managerDecision.validation');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

router.get('/', managerLeaveRequestController.listTeamRequests);
router.get('/calendar', managerLeaveRequestController.calendar);
router.post('/bulk-decision', bulkDecisionValidation, validate, managerLeaveRequestController.bulkDecide);
router.patch('/:id/decision', decisionValidation, validate, managerLeaveRequestController.decide);

module.exports = router;
