const express = require('express');
const { requireJwtAuth } = require('~/server/middleware');
const { checkAdmin } = require('~/server/middleware/roles');
const {
  inviteAdminController,
  acceptAdminInvitationController,
} = require('~/server/controllers/AdminInvitationController');

const router = express.Router();

router.post('/invite', requireJwtAuth, checkAdmin, inviteAdminController);
router.post('/accept', acceptAdminInvitationController);

module.exports = router;
