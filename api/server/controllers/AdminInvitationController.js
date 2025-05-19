const { logger } = require('~/config');
const { SystemRoles } = require('librechat-data-provider');
const { registerUser } = require('~/server/services/AuthService');
const { findUser } = require('~/models/userMethods');
const {
  findPendingAdminInvitationByEmailAndToken,
  updateAdminInvitationAsAccepted,
  findAllPendingAdminInvitations,
} = require('~/models/AdminInvitation');

/**
 * Controller function to accept an admin invitation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const acceptAdminInvitationController = async (req, res) => {
  try {
    const { token, email, password, confirm_password, name, username } = req.body;

    if (!token || !email || !password || !confirm_password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find the invitation with the matching email and token
    const invitation = await findPendingAdminInvitationByEmailAndToken(email, token);

    if (!invitation) {
      return res.status(404).json({ error: 'Invalid or expired invitation token' });
    }

    // Check if the invitation has expired
    if (invitation.invitationExpires && new Date(invitation.invitationExpires) < new Date()) {
      return res.status(400).json({ error: 'Invitation has expired' });
    }

    // Register the new user
    const userData = {
      email,
      password,
      confirm_password,
      name,
      username: username || '',
    };

    const registerResult = await registerUser(userData, {
      emailVerified: true,
      role: [SystemRoles.ADMIN],
    });

    if (registerResult.status !== 200) {
      return res.status(registerResult.status).json({ error: registerResult.message });
    }

    // Find the newly created user
    const user = await findUser({ email });
    if (!user) {
      return res.status(500).json({ error: 'Failed to create user account' });
    }

    // Update the invitation as accepted
    const updatedInvitation = await updateAdminInvitationAsAccepted(invitation._id);

    if (!updatedInvitation) {
      return res.status(500).json({ error: 'Failed to update invitation status' });
    }

    res.status(200).json({
      message: 'Invitation accepted successfully',
    });
  } catch (error) {
    logger.error('[/admin-invitations/accept] Error accepting invitation', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Controller function to get all pending admin invitations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPendingAdminInvitationsController = async (req, res) => {
  try {
    const pendingInvitations = await findAllPendingAdminInvitations();
    res.status(200).json(pendingInvitations);
  } catch (error) {
    logger.error('[/admin-invitations/pending] Error getting pending invitations', error);
    res.status(500).json({ message: 'Error retrieving pending admin invitations' });
  }
};

module.exports = {
  acceptAdminInvitationController,
  getPendingAdminInvitationsController,
};
