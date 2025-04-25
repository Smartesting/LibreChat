const { logger } = require('~/config');
const bcrypt = require('bcryptjs');
const {
  createTrainingOrganization,
  getListTrainingOrganizations,
  updateTrainingOrganizationAdmin,
  deleteTrainingOrganization,
} = require('~/models/TrainingOrganization');
const { processAdministrators } = require('~/server/services/TrainingOrganizationService');
const { registerUser } = require('~/server/services/AuthService');
const { findUser } = require('~/models/userMethods');

/**
 * Creates a training organization.
 * @route POST /training-organizations
 * @param {ServerRequest} req - The request object.
 * @param {TrainingOrganizationCreateParams} req.body - The request body.
 * @param {ServerResponse} res - The response object.
 * @returns {TrainingOrganization} 201 - success response - application/json
 */
const createTrainingOrganizationHandler = async (req, res) => {
  try {
    const { name, administrators } = req.body;

    // Process administrators (check if they exist, generate tokens, send emails)
    const processedAdministrators = await processAdministrators(administrators, name);

    // Create the training organization with processed administrators
    const trainingOrganization = await createTrainingOrganization({
      name,
      administrators: processedAdministrators,
    });

    res.status(201).json(trainingOrganization);
  } catch (error) {
    logger.error('[/training-organizations] Error creating training organization', error);

    // Check if it's a validation error (Mongoose ValidationError)
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: error.message });
  }
};

/**
 * Retrieves all training organizations.
 * @route GET /training-organizations
 * @param {object} req - Express Request
 * @param {ServerResponse} res - The response object.
 * @returns {Promise<TrainingOrganization[]>} 200 - success response - application/json
 */
const getListTrainingOrganizationsHandler = async (req, res) => {
  try {
    const trainingOrganizations = await getListTrainingOrganizations();
    return res.json(trainingOrganizations);
  } catch (error) {
    logger.error('[/training-organizations] Error listing training organizations', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Accepts an administrator invitation and creates a new user account.
 * @route POST /training-organizations/accept-admin-invitation
 * @param {ServerRequest} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.token - The invitation token.
 * @param {string} req.body.email - The administrator email.
 * @param {string} req.body.password - The new password.
 * @param {string} req.body.confirm_password - The confirmation password.
 * @param {string} req.body.name - The user's name.
 * @param {string} [req.body.username] - Optional username. If not provided, will use the part before @ in the email.
 * @param {ServerResponse} res - The response object.
 * @returns {Object} 200 - success response - application/json
 */
const acceptAdminInvitationHandler = async (req, res) => {
  try {
    const { token, email, password, confirm_password, name, username } = req.body;

    if (!token || !email || !password || !confirm_password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get all organizations
    const organizations = await getListTrainingOrganizations();

    // Find the organization and administrator with the matching email and token
    let org = null;
    let admin = null;

    for (const organization of organizations) {
      const matchingAdmin = organization.administrators.find(
        (a) =>
          a.email.toLowerCase() === email.toLowerCase() &&
          a.status === 'invited' &&
          a.invitationToken !== undefined,
      );

      if (matchingAdmin) {
        // Verify the token using bcrypt
        const isValidToken = bcrypt.compareSync(token, matchingAdmin.invitationToken);
        if (isValidToken) {
          org = organization;
          admin = matchingAdmin;
          break;
        }
      }
    }

    if (!org || !admin) {
      return res.status(404).json({ error: 'Invalid or expired invitation token' });
    }

    // Check if the invitation has expired
    if (admin.invitationExpires && new Date(admin.invitationExpires) < new Date()) {
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

    const registerResult = await registerUser(userData, { emailVerified: true });

    if (registerResult.status !== 200) {
      return res.status(registerResult.status).json({ error: registerResult.message });
    }

    // Find the newly created user
    const user = await findUser({ email });
    if (!user) {
      return res.status(500).json({ error: 'Failed to create user account' });
    }

    // Update the administrator in the training organization
    const updatedOrg = await updateTrainingOrganizationAdmin(org._id, email, {
      userId: user._id,
      status: 'active',
      activatedAt: new Date(),
    });

    if (!updatedOrg) {
      return res.status(500).json({ error: 'Failed to update administrator status' });
    }

    res.status(200).json({
      message: 'Invitation accepted successfully',
    });
  } catch (error) {
    logger.error('[/training-organizations/accept-admin-invitation] Error accepting invitation', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Deletes a training organization by ID.
 * @route DELETE /training-organizations/:id
 * @param {ServerRequest} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.id - The ID of the training organization to delete.
 * @param {ServerResponse} res - The response object.
 * @returns {Object} 200 - success response - application/json
 */
const deleteTrainingOrganizationHandler = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Missing organization ID' });
    }

    const deletedOrg = await deleteTrainingOrganization(id);

    if (!deletedOrg) {
      return res.status(404).json({ error: 'Training organization not found' });
    }

    res.status(204).send();
  } catch (error) {
    logger.error(`[/training-organizations/${req.params.id}] Error deleting training organization`, error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createTrainingOrganization: createTrainingOrganizationHandler,
  getListTrainingOrganizations: getListTrainingOrganizationsHandler,
  acceptAdminInvitation: acceptAdminInvitationHandler,
  deleteTrainingOrganization: deleteTrainingOrganizationHandler,
};
