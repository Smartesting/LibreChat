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
const { checkAdmin, checkOrgAccess } = require('~/server/middleware/roles');

router.post('/', requireJwtAuth, checkAdmin, createTrainingOrganization);
router.get('/', requireJwtAuth, getListTrainingOrganizations);
router.get('/:id', requireJwtAuth, checkOrgAccess, getTrainingOrganizationById);
router.delete('/:id', requireJwtAuth, checkAdmin, deleteTrainingOrganization);
router.post('/accept-admin-invitation', acceptAdminInvitation);

module.exports = router;
