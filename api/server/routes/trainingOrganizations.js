const { requireJwtAuth } = require('~/server/middleware');

const express = require('express');
const router = express.Router();

const {
  createTrainingOrganization,
  getListTrainingOrganizations,
  acceptAdminInvitation,
  deleteTrainingOrganization,
} = require('~/server/controllers/TrainingOrganizationController');
const { checkAdmin } = require('~/server/middleware/roles');

router.post('/', requireJwtAuth, checkAdmin, createTrainingOrganization);
router.get('/', requireJwtAuth, checkAdmin, getListTrainingOrganizations);
router.delete('/:id', requireJwtAuth, checkAdmin, deleteTrainingOrganization);
router.post('/accept-admin-invitation', acceptAdminInvitation);

module.exports = router;
