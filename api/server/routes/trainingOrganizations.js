const { requireJwtAuth } = require('~/server/middleware');

const express = require('express');
const router = express.Router();

const {
  createTrainingOrganization,
  getListTrainingOrganizations,
  acceptAdminInvitation,
} = require('~/server/controllers/TrainingOrganizationController');

router.post('/', requireJwtAuth, createTrainingOrganization);
router.get('/', requireJwtAuth, getListTrainingOrganizations);
router.post('/accept-admin-invitation', acceptAdminInvitation);

module.exports = router;
