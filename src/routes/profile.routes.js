const express = require('express');
const profileController = require('../controllers/profile.controller');
const { updateProfileValidation } = require('../validations/profile.validation');
const validate = require('../middlewares/validate.middleware');
const { avatarUpload, handleUploadError } = require('../middlewares/avatarUpload.middleware');

const router = express.Router();

router.get('/', profileController.getOwn);
router.put(
  '/',
  avatarUpload.single('profile_photo'),
  handleUploadError,
  updateProfileValidation,
  validate,
  profileController.updateOwn
);

module.exports = router;
