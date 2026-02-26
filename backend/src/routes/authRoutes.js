const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  getProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  testEmailSettings,
} = require('../controllers/auth.controller');

const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/roles');

router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/register', protect, registerUser);
router.get('/me', protect, getProfile);
router.post('/change-password', protect, changePassword);
router.post('/test-email', protect, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), testEmailSettings);

module.exports = router;
