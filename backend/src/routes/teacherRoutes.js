const express = require('express');
const router = express.Router();

const {
  listTeachers,
  getTeacherStats,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} = require('../controllers/teacher.controller');

const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/roles');
const { uploadProfilePhoto } = require('../middleware/upload');

router.use(protect);

router.get('/', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER), listTeachers);
router.get('/stats', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER), getTeacherStats);
router.post('/', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), uploadProfilePhoto.single('profilePhoto'), createTeacher);
router.put('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), uploadProfilePhoto.single('profilePhoto'), updateTeacher);
router.delete('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), deleteTeacher);

module.exports = router;
