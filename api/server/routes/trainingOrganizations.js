const { requireJwtAuth } = require('~/server/middleware');

const express = require('express');
const router = express.Router();

const {
  createTrainingOrganization,
  getListTrainingOrganizations,
  acceptAdminInvitation,
  deleteTrainingOrganization,
  getTrainingOrganizationById,
} = require('~/server/controllers/TrainingOrganizationController');
const { checkAdmin } = require('~/server/middleware/roles');

router.post('/', requireJwtAuth, checkAdmin, createTrainingOrganization);
router.get('/', requireJwtAuth, checkAdmin, getListTrainingOrganizations);
router.get('/:id', requireJwtAuth, checkAdmin, getTrainingOrganizationById);
router.delete('/:id', requireJwtAuth, checkAdmin, deleteTrainingOrganization);
router.post('/accept-admin-invitation', acceptAdminInvitation);

module.exports = router;
