const express = require('express');
const roleController = require('../controllers/role.controller');

const router = express.Router();

router.get('/', roleController.list);

module.exports = router;
