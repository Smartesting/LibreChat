const { requireJwtAuth } = require('~/server/middleware');

const express = require('express');
const router = express.Router();

const {
  createTrainingOrganization,
} = require('~/server/controllers/TrainingOrganizationController');

router.post('/', requireJwtAuth, createTrainingOrganization);

module.exports = router;
