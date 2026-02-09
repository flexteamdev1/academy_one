const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  getProfile,
} = require('../controllers/auth.controller');

const { protect } = require('../middleware/auth');

router.post('/login', loginUser);
router.post('/register', protect, registerUser);
router.get('/me', protect, getProfile);

module.exports = router;
