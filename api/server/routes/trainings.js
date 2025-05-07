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
const { checkAdmin, checkOrgAccess } = require('~/server/middleware/roles');

// Create a new training
router.post('/', requireJwtAuth, checkOrgAccess, create);

// Get all trainings for a specific organization
router.get('/organization/:organizationId', requireJwtAuth, checkOrgAccess, getByOrganization);

// Get a training by ID
router.get('/:id', requireJwtAuth, checkOrgAccess, getById);

// Update a training
router.put('/:id', requireJwtAuth, checkOrgAccess, update);

// Delete a training
router.delete('/:id', requireJwtAuth, checkOrgAccess, remove);

module.exports = router;