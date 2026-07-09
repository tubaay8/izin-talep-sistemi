const express = require('express');
const adminUserController = require('../controllers/adminUser.controller');
const { createUserValidation, updateUserValidation } = require('../validations/adminUser.validation');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

router.get('/', adminUserController.list);
router.get('/:id', adminUserController.getOne);
router.post('/', createUserValidation, validate, adminUserController.create);
router.put('/:id', updateUserValidation, validate, adminUserController.update);

module.exports = router;
