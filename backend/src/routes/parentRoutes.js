const express = require('express');
const router = express.Router();

const { listParents, getParentById } = require('../controllers/parent.controller');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/roles');

router.use(protect);

router.get('/', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), listParents);
router.get('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), getParentById);

module.exports = router;
