const express = require('express');
const authController = require('../controllers/auth.controller');
const { loginValidation, changePasswordValidation } = require('../validations/auth.validation');
const {
  forgotPasswordValidation,
  resetPasswordValidation,
} = require('../validations/passwordReset.validation');
const validate = require('../middlewares/validate.middleware');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/login', loginValidation, validate, authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.me);
router.put('/change-password', requireAuth, changePasswordValidation, validate, authController.changePassword);
router.post('/forgot-password', forgotPasswordValidation, validate, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidation, validate, authController.resetPassword);

module.exports = router;
