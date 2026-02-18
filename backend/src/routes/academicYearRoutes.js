const express = require('express');
const router = express.Router();

const {
  listAcademicYears,
  getAcademicYearStats,
  createAcademicYear,
  updateAcademicYear,
  activateAcademicYear,
  deleteAcademicYear,
} = require('../controllers/academicYear.controller');

const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/roles');

router.use(protect);

router.get('/', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER), listAcademicYears);
router.get('/stats', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER), getAcademicYearStats);
router.post('/', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), createAcademicYear);
router.put('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), updateAcademicYear);
router.patch('/:id/activate', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), activateAcademicYear);
router.delete('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), deleteAcademicYear);

module.exports = router;
