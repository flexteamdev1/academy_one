const express = require('express');
const router = express.Router();

const {
  listAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} = require('../controllers/admin.controller');

const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/roles');

router.use(protect);

router.get('/', authorize(ROLES.SUPER_ADMIN), listAdmins);
router.post('/', authorize(ROLES.SUPER_ADMIN), createAdmin);
router.put('/:id', authorize(ROLES.SUPER_ADMIN), updateAdmin);
router.delete('/:id', authorize(ROLES.SUPER_ADMIN), deleteAdmin);

module.exports = router;
