const express = require('express');
const router = express.Router();

const {
  listClasses,
  getClassStats,
  getClassMeta,
  createClass,
  updateClass,
  deleteClass,
} = require('../controllers/class.controller');

const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/roles');

router.use(protect);

router.get('/', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER), listClasses);
router.get('/stats', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER), getClassStats);
router.get('/meta', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER), getClassMeta);
router.post('/', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), createClass);
router.put('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), updateClass);
router.delete('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), deleteClass);

module.exports = router;
