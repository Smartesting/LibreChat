const express = require('express');
const {
  acceptInvitationController,
  getAdminInvitationsController,
  getOrgAdminInvitationsController,
  getOrgTrainerInvitationsController,
} = require('~/server/controllers/InvitationController');
const { requireJwtAuth } = require('~/server/middleware');
const { checkAdmin, checkOrgAccess } = require('~/server/middleware/roles');

const router = express.Router();

router.post('/accept', acceptInvitationController);
router.get('/admins', requireJwtAuth, checkAdmin, getAdminInvitationsController);
router.get('/organizations/:orgId/admins', requireJwtAuth, checkOrgAccess, getOrgAdminInvitationsController);
router.get('/organizations/:orgId/trainers', requireJwtAuth, checkOrgAccess, getOrgTrainerInvitationsController);

module.exports = router;
