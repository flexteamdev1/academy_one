const express = require('express');
const router = express.Router();

const { getAttendance, upsertAttendance, getAttendanceSummary, getClassAttendanceHistory, getMyAttendance } = require('../controllers/attendance.controller');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/roles');

router.use(protect);

router.get('/', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER), getAttendance);
router.get('/summary', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER), getAttendanceSummary);
router.get('/history', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER), getClassAttendanceHistory);
router.get('/my-attendance', authorize(ROLES.STUDENT, ROLES.PARENT), getMyAttendance);
router.post('/', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER), upsertAttendance);

module.exports = router;
