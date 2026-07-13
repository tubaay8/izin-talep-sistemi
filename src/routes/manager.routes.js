const express = require('express');
const userController = require('../controllers/user.controller');

const router = express.Router();

router.get('/', userController.listManagers);
router.get('/available', userController.listAvailableManagers);

module.exports = router;
