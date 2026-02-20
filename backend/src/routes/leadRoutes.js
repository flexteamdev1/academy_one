const express = require('express');
const router = express.Router();

const {
  listLeads,
  createLead,
  updateLead,
  deleteLead,
} = require('../controllers/lead.controller');

const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/roles');

router.use(protect);

router.get('/', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER), listLeads);
router.post('/', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), createLead);
router.put('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), updateLead);
router.delete('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), deleteLead);

module.exports = router;
