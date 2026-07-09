const express = require('express');
const leaveTypeController = require('../controllers/leaveType.controller');

const router = express.Router();

router.get('/', leaveTypeController.list);

module.exports = router;
