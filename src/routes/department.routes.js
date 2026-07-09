const express = require('express');
const departmentController = require('../controllers/department.controller');

const router = express.Router();

router.get('/', departmentController.list);

module.exports = router;
