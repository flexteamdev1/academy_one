const express = require('express');
const router = express.Router();

const {
  listStudents,
  getStudentStats,
  getMyStudents,
  getStudentById,
  createStudent,
  updateStudent,
  updateMyStudent,
  deleteStudent,
} = require('../controllers/student.controller');

const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/roles');
const { uploadProfilePhoto } = require('../middleware/upload');

router.use(protect);

router.get('/', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER), listStudents);
router.get('/stats', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER), getStudentStats);
router.get('/me', authorize(ROLES.STUDENT, ROLES.PARENT), getMyStudents);
router.put('/me/:id', authorize(ROLES.STUDENT, ROLES.PARENT), uploadProfilePhoto.single('profilePhoto'), updateMyStudent);
router.get('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER), getStudentById);
router.post('/', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), uploadProfilePhoto.single('profilePhoto'), createStudent);
router.put('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), uploadProfilePhoto.single('profilePhoto'), updateStudent);
router.delete('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), deleteStudent);

module.exports = router;
