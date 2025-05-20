const express = require('express');
const {
  acceptInvitationController,
  getAdminInvitationsController,
} = require('~/server/controllers/InvitationController');
const { requireJwtAuth } = require('~/server/middleware');
const { checkAdmin } = require('~/server/middleware/roles');

const router = express.Router();

router.post('/accept', acceptInvitationController);
router.get('/admins', requireJwtAuth, checkAdmin, getAdminInvitationsController);

module.exports = router;
