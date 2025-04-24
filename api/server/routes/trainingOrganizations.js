const { requireJwtAuth } = require('~/server/middleware');

const express = require('express');
const router = express.Router();

const {
  createTrainingOrganization,
  getListTrainingOrganizations,
  acceptAdminInvitation,
} = require('~/server/controllers/TrainingOrganizationController');
const { checkAdmin } = require('~/server/middleware/roles');

router.post('/', requireJwtAuth, checkAdmin, createTrainingOrganization);
router.get('/', requireJwtAuth, checkAdmin, getListTrainingOrganizations);
router.post('/accept-admin-invitation', acceptAdminInvitation);

module.exports = router;
