const { requireJwtAuth } = require('~/server/middleware');

const express = require('express');
const router = express.Router();

const {
  createTrainingOrganization,
  getListTrainingOrganizations,
} = require('~/server/controllers/TrainingOrganizationController');

router.post('/', requireJwtAuth, createTrainingOrganization);
router.get('/', requireJwtAuth, getListTrainingOrganizations);

module.exports = router;
