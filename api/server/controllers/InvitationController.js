const { logger } = require('~/config');
const { SystemRoles } = require('librechat-data-provider');
const { registerUser } = require('~/server/services/AuthService');
const { findUser } = require('~/models/userMethods');
const { findInvitationByEmailAndToken, deleteInvitationById } = require('~/models/Invitation');
const {
  addTrainerToOrganization,
  addAdminToOrganization,
} = require('~/models/TrainingOrganization');

/**
 * Controller function to accept an invitation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const acceptInvitationController = async (req, res) => {
  try {
    const { token, email, password, confirm_password, name, username } = req.body;

    if (!token || !email || !password || !confirm_password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find the invitation with the matching email and token
    const invitation = await findInvitationByEmailAndToken(email, token);

    if (!invitation) {
      return res.status(404).json({ error: 'Invalid or expired invitation token' });
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
      role: computeUserRolesFromInvitation(invitation),
    });

    if (registerResult.status !== 200) {
      return res.status(registerResult.status).json({ error: registerResult.message });
    }

    // Find the newly created user
    const user = await findUser({ email });
    if (!user) {
      return res.status(500).json({ error: 'Failed to create user account' });
    }

    // Add user as admin to organizations in invitation.roles.orgAdmin
    for (const orgId of invitation.roles.orgAdmin) {
      try {
        await addAdminToOrganization(orgId, user._id, user.email);
      } catch {
        /* empty */
      }
    }

    // Add user as trainer to organizations in invitation.roles.orgTrainer
    for (const orgId of invitation.roles.orgTrainer) {
      try {
        await addTrainerToOrganization(orgId, user._id, user.email);
      } catch {
        /* empty */
      }
    }

    try {
      await deleteInvitationById(invitation._id);
    } catch {
      /* empty */
    }

    res.status(200).json({
      message: 'Invitation accepted successfully',
    });
  } catch (error) {
    logger.error('[/invitations/accept] Error accepting invitation', error);
    res.status(500).json({ error: error.message });
  }
};

const computeUserRolesFromInvitation = (invitation) => {
  const { superAdmin, orgAdmin, orgTrainer } = invitation.roles;
  const roles = [];

  if (superAdmin) {
    roles.push(SystemRoles.ADMIN);
  }

  if (orgAdmin.length > 0) {
    roles.push(SystemRoles.ORGADMIN);
  }

  if (orgTrainer.length > 0) {
    roles.push(SystemRoles.TRAINER);
  }

  return roles;
};

module.exports = {
  acceptInvitationController,
};
