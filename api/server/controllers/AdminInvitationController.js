const { logger } = require('~/config');
const { SystemRoles } = require('librechat-data-provider');
const { processAdminInvitation } = require('~/server/services/AdminInvitationService');
const { registerUser } = require('~/server/services/AuthService');
const { findUser, updateUser } = require('~/models/userMethods');
const {
  findPendingAdminInvitationByEmailAndToken,
  updateAdminInvitationAsAccepted, findAllPendingAdminInvitations,
  findPendingAdminInvitationByEmail, deleteAdminInvitationById,
} = require('~/models/AdminInvitation');
const AdminInvitation = require('~/models/AdminInvitation');

/**
 * Controller function to invite a new admin
 * @param {Object} req - Express request object with email in the body
 * @param {Object} res - Express response object
 */
const inviteAdminController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Process the invitation
    const result = await processAdminInvitation(email);

    if (!result.success) {
      return res.status(result.status).json({ message: result.message });
    }

    logger.info(`Admin invitation sent to ${email}`);
    res.status(result.status).json({ message: result.message });
  } catch (error) {
    logger.error('Error sending admin invitation:', error);
    res.status(500).json({ message: 'Error sending admin invitation' });
  }
};

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

    const registerResult = await registerUser(userData, { emailVerified: true, role: SystemRoles.ADMIN });

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

/**
 * Controller function to remove admin role from a user
 * @param {Object} req - Express request object with email in the body
 * @param {Object} res - Express response object
 */
const removeAdminRoleController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists
    const user = await findUser({ email }, 'email _id role');

    if (user) {
      // If user exists and has ADMIN role, downgrade to USER
      if (user.role === SystemRoles.ADMIN) {
        const updatedUser = await updateUser(user._id, { role: SystemRoles.USER });
        if (!updatedUser) {
          return res.status(500).json({ message: 'Failed to update user role' });
        }
        logger.info(`Admin role removed from user ${email}`);
        return res.status(200).json({ message: 'Admin role removed successfully' });
      } else {
        return res.status(400).json({ message: 'User does not have admin role' });
      }
    } else {
      // If user doesn't exist, check if there's a pending admin invitation
      const pendingInvitation = await findPendingAdminInvitationByEmail(email);

      if (pendingInvitation) {
        // Delete the pending invitation
        await deleteAdminInvitationById(pendingInvitation._id);
        logger.info(`Admin invitation deleted for ${email}`);
        return res.status(200).json({ message: 'Admin invitation deleted successfully' });
      } else {
        return res.status(404).json({ message: 'User not found and no pending invitation exists' });
      }
    }
  } catch (error) {
    logger.error('Error removing admin role:', error);
    res.status(500).json({ message: 'Error removing admin role' });
  }
};

module.exports = {
  inviteAdminController,
  acceptAdminInvitationController,
  getPendingAdminInvitationsController,
  removeAdminRoleController,
};
