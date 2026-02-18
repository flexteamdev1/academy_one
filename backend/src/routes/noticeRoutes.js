const express = require('express');

const { listNotices, createNotice } = require('../controllers/notice.controller');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.use(protect);

router.get(
  '/',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT),
  listNotices,
);
router.post('/', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER), createNotice);

module.exports = router;
