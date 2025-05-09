const express = require('express');
const { requireJwtAuth } = require('~/server/middleware');
const { checkAdmin } = require('~/server/middleware/roles');
const {
  inviteAdminController,
  acceptAdminInvitationController,
  getPendingAdminInvitationsController,
} = require('~/server/controllers/AdminInvitationController');

const router = express.Router();

router.post('/invite', requireJwtAuth, checkAdmin, inviteAdminController);
router.post('/accept', acceptAdminInvitationController);
router.get('/pending', requireJwtAuth, checkAdmin, getPendingAdminInvitationsController);

module.exports = router;
