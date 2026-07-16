const express = require('express');
const managerStatisticsController = require('../controllers/managerStatistics.controller');

const router = express.Router();

router.get('/', managerStatisticsController.getStatistics);

module.exports = router;
