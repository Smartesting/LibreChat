const express = require('express');
const { acceptInvitationController } = require('~/server/controllers/InvitationController');

const router = express.Router();

router.post('/accept', acceptInvitationController);

module.exports = router;
