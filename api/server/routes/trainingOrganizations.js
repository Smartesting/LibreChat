const { requireJwtAuth } = require('~/server/middleware');

const express = require('express');
const router = express.Router();

const {
  createTrainingOrganization,
  getListTrainingOrganizations,
  acceptAdminInvitation,
  deleteTrainingOrganization,
  getTrainingOrganizationById,
  addAdministrator,
  removeAdministrator,
  addTrainer,
  removeTrainer,
} = require('~/server/controllers/TrainingOrganizationController');
const { checkAdmin, checkOrgAccess } = require('~/server/middleware/roles');

router.post('/', requireJwtAuth, checkAdmin, createTrainingOrganization);
router.get('/', requireJwtAuth, getListTrainingOrganizations);
router.get('/:id', requireJwtAuth, checkOrgAccess, getTrainingOrganizationById);
router.delete('/:id', requireJwtAuth, checkAdmin, deleteTrainingOrganization);
router.post('/accept-admin-invitation', acceptAdminInvitation);
router.post('/:id/administrators', requireJwtAuth, checkOrgAccess, addAdministrator);
router.delete('/:id/administrators/:email', requireJwtAuth, checkOrgAccess, removeAdministrator);
router.post('/:id/trainers', requireJwtAuth, checkOrgAccess, addTrainer);
router.delete('/:id/trainers/:email', requireJwtAuth, checkOrgAccess, removeTrainer);

module.exports = router;
