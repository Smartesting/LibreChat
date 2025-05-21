const { requireJwtAuth } = require('~/server/middleware');

const express = require('express');
const router = express.Router();

const {
  createTrainingOrganization,
  getListTrainingOrganizations,
  acceptAdminInvitation,
  acceptTrainerInvitation,
  deleteTrainingOrganization,
  getTrainingOrganizationById,
  addAdministrator,
  removeAdministrator,
  addTrainer,
  removeTrainer,
  getActiveOrganizationMembers,
} = require('~/server/controllers/TrainingOrganizationController');
const { checkAdmin, checkOrgAccess } = require('~/server/middleware/roles');

router.post('/', requireJwtAuth, checkAdmin, createTrainingOrganization);
router.get('/', requireJwtAuth, getListTrainingOrganizations);
router.get('/:organizationId', requireJwtAuth, checkOrgAccess, getTrainingOrganizationById);
router.delete('/:organizationId', requireJwtAuth, checkAdmin, deleteTrainingOrganization);
router.post('/accept-admin-invitation', acceptAdminInvitation);
router.post('/accept-trainer-invitation', acceptTrainerInvitation);
router.post('/:organizationId/administrators', requireJwtAuth, checkOrgAccess, addAdministrator);
router.delete(
  '/:organizationId/administrators/:email',
  requireJwtAuth,
  checkOrgAccess,
  removeAdministrator,
);
router.post('/:organizationId/trainers', requireJwtAuth, checkOrgAccess, addTrainer);
router.delete('/:organizationId/trainers/:email', requireJwtAuth, checkOrgAccess, removeTrainer);
router.get(
  '/:organizationId/active-members',
  requireJwtAuth,
  checkOrgAccess,
  getActiveOrganizationMembers,
);

module.exports = router;
