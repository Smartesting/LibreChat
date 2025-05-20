const express = require('express');
const { requireJwtAuth } = require('~/server/middleware');
const { checkAdmin } = require('~/server/middleware/roles');
const {
  getPendingAdminInvitationsController,
} = require('~/server/controllers/AdminInvitationController');

const router = express.Router();

router.get('/pending', requireJwtAuth, checkAdmin, getPendingAdminInvitationsController);

module.exports = router;
