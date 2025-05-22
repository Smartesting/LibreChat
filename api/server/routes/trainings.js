const { requireJwtAuth } = require('~/server/middleware');

const express = require('express');
const router = express.Router();

const {
  create,
  getByOrganization,
  getById,
  update,
  remove,
} = require('~/server/controllers/TrainingController');
const { checkOrgAccess } = require('~/server/middleware/roles');

// Create a new training
router.post('/:organizationId/trainings/create', requireJwtAuth, checkOrgAccess, create);

// Get all trainings for a specific organization
router.get(
  '/:organizationId/trainings/getByOrg',
  requireJwtAuth,
  checkOrgAccess,
  getByOrganization,
);

// Get a training by ID
router.get('/:organizationId/trainings/get/:trainingId', requireJwtAuth, checkOrgAccess, getById);

// Update a training
router.put('/:organizationId/trainings/update/:trainingId', requireJwtAuth, checkOrgAccess, update);

// Delete a training
router.delete(
  '/:organizationId/trainings/delete/:trainingId',
  requireJwtAuth,
  checkOrgAccess,
  remove,
);

module.exports = router;
