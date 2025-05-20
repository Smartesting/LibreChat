const { logger } = require('~/config');
const bcrypt = require('bcryptjs');
const { SystemRoles } = require('librechat-data-provider');
const {
  createTrainingOrganization,
  getListTrainingOrganizations,
  updateTrainingOrganizationAdmin,
  updateTrainingOrganizationTrainer,
  deleteTrainingOrganization,
  getTrainingOrganizationById,
  TrainingOrganization,
} = require('~/models/TrainingOrganization');
const {
  processAdministrators,
  processTrainers,
} = require('~/server/services/TrainingOrganizationService');
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

    // Check if a training organization with the same name already exists
    const existingOrganizations = await getListTrainingOrganizations();
    const existingOrg = existingOrganizations.find(
      (org) => org.name.toLowerCase() === name.toLowerCase(),
    );

    if (existingOrg) {
      return res
        .status(400)
        .json({ error: 'A training organization with this name already exists' });
    }

    // Create the training organization with processed administrators
    const trainingOrganization = await createTrainingOrganization({
      name,
    });

    // Process administrators (check if they exist, remove duplicates, generate tokens, send emails)
    await processAdministrators(administrators, trainingOrganization._id, name);

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
 * Retrieves all training organizations that the user can administer.
 * @route GET /training-organizations
 * @param {object} req - Express Request
 * @param {ServerResponse} res - The response object.
 * @returns {Promise<TrainingOrganization[]>} 200 - success response - application/json
 */
const getListTrainingOrganizationsHandler = async (req, res) => {
  try {
    const trainingOrganizations = await getListTrainingOrganizations(req.user);
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
          !a.activatedAt &&
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

    const registerResult = await registerUser(userData, {
      emailVerified: true,
      role: [SystemRoles.ORGADMIN],
    });

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
      activatedAt: new Date(),
    });

    if (!updatedOrg) {
      return res.status(500).json({ error: 'Failed to update administrator status' });
    }

    res.status(200).json({
      message: 'Invitation accepted successfully',
    });
  } catch (error) {
    logger.error(
      '[/training-organizations/accept-admin-invitation] Error accepting invitation',
      error,
    );
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
    logger.error(
      `[/training-organizations/${req.params.id}] Error deleting training organization`,
      error,
    );
    res.status(500).json({ error: error.message });
  }
};

/**
 * Retrieves a training organization by ID.
 * @route GET /training-organizations/:id
 * @param {ServerRequest} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.id - The ID of the training organization to retrieve.
 * @param {ServerResponse} res - The response object.
 * @returns {Promise<TrainingOrganization>} 200 - success response - application/json
 */
const getTrainingOrganizationByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Missing organization ID' });
    }

    const trainingOrganization = await getTrainingOrganizationById(id);

    if (!trainingOrganization) {
      return res.status(404).json({ error: 'Training organization not found' });
    }

    return res.json(trainingOrganization);
  } catch (error) {
    logger.error(
      `[/training-organizations/${req.params.id}] Error retrieving training organization`,
      error,
    );
    res.status(500).json({ error: error.message });
  }
};

/**
 * Adds an administrator to a training organization.
 * @route POST /training-organizations/:id/administrators
 * @param {ServerRequest} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.id - The ID of the training organization.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.email - The email of the administrator to add.
 * @param {ServerResponse} res - The response object.
 * @returns {Object} 200 - success response - application/json
 */
const addAdministratorHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Missing organization ID' });
    }

    if (!email || !email.match(/\S+@\S+\.\S+/)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const trainingOrganization = await getTrainingOrganizationById(id);
    if (!trainingOrganization) {
      return res.status(404).json({ error: 'Training organization not found' });
    }

    const existingAdmin = trainingOrganization.administrators.find(
      (admin) => admin.email.toLowerCase() === email.toLowerCase(),
    );

    if (existingAdmin) {
      return res.status(400).json({ error: 'Administrator already exists in this organization' });
    }

    await processAdministrators([email], id, trainingOrganization.name);

    const updatedOrg = await getTrainingOrganizationById(id);

    if (!updatedOrg) {
      return res.status(500).json({ error: 'Failed to find updated training organization' });
    }

    res.status(200).json(updatedOrg);
  } catch (error) {
    logger.error(
      `[/training-organizations/${req.params.id}/administrators] Error adding administrator`,
      error,
    );
    res.status(500).json({ error: error.message });
  }
};

/**
 * Removes an administrator from a training organization.
 * @route DELETE /training-organizations/:id/administrators/:email
 * @param {ServerRequest} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.id - The ID of the training organization.
 * @param {string} req.params.email - The email of the administrator to remove.
 * @param {ServerResponse} res - The response object.
 * @returns {Object} 200 - success response - application/json
 */
const removeAdministratorHandler = async (req, res) => {
  try {
    const { id, email } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Missing organization ID' });
    }
    if (!email) {
      return res.status(400).json({ error: 'Missing administrator email' });
    }

    const trainingOrganization = await getTrainingOrganizationById(id);
    if (!trainingOrganization) {
      return res.status(404).json({ error: 'Training organization not found' });
    }

    const adminIndex = trainingOrganization.administrators.findIndex(
      (admin) => admin.email.toLowerCase() === email.toLowerCase(),
    );
    if (adminIndex === -1) {
      return res.status(404).json({ error: 'Administrator not found in this organization' });
    }

    trainingOrganization.administrators.splice(adminIndex, 1);

    const updatedOrg = await TrainingOrganization.findByIdAndUpdate(
      id,
      { administrators: trainingOrganization.administrators },
      { new: true },
    ).lean();
    if (!updatedOrg) {
      return res.status(500).json({ error: 'Failed to update training organization' });
    }

    res.status(200).json(updatedOrg);
  } catch (error) {
    logger.error(
      `[/training-organizations/${req.params.id}/administrators/${req.params.email}] Error removing administrator`,
      error,
    );
    res.status(500).json({ error: error.message });
  }
};

/**
 * Adds a trainer to a training organization.
 * @route POST /training-organizations/:id/trainers
 * @param {ServerRequest} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.id - The ID of the training organization.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.email - The email of the trainer to add.
 * @param {ServerResponse} res - The response object.
 * @returns {Object} 200 - success response - application/json
 */
const addTrainerHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Missing organization ID' });
    }

    if (!email || !email.match(/\S+@\S+\.\S+/)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const trainingOrganization = await getTrainingOrganizationById(id);

    if (!trainingOrganization) {
      return res.status(404).json({ error: 'Training organization not found' });
    }

    const existingTrainer = trainingOrganization.trainers.find(
      (trainer) => trainer.email.toLowerCase() === email.toLowerCase(),
    );

    if (existingTrainer) {
      return res.status(400).json({ error: 'Trainer already exists in this organization' });
    }

    const processedTrainers = await processTrainers([email], trainingOrganization.name);

    if (!processedTrainers || processedTrainers.length === 0) {
      return res.status(500).json({ error: 'Failed to process trainer' });
    }

    const updatedOrg = await TrainingOrganization.findByIdAndUpdate(
      id,
      { trainers: [...trainingOrganization.trainers, ...processedTrainers] },
      { new: true },
    ).lean();

    if (!updatedOrg) {
      return res.status(500).json({ error: 'Failed to update training organization' });
    }

    res.status(200).json(updatedOrg);
  } catch (error) {
    logger.error(`[/training-organizations/${req.params.id}/trainers] Error adding trainer`, error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Accepts a trainer invitation and creates a new trainer account.
 * @route POST /training-organizations/accept-trainer-invitation
 * @param {ServerRequest} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.token - The invitation token.
 * @param {string} req.body.email - The trainer email.
 * @param {string} req.body.password - The new password.
 * @param {string} req.body.confirm_password - The confirmation password.
 * @param {string} req.body.name - The user's name.
 * @param {string} [req.body.username] - Optional username. If not provided, will use the part before @ in the email.
 * @param {ServerResponse} res - The response object.
 * @returns {Object} 200 - success response - application/json
 */
const acceptTrainerInvitationHandler = async (req, res) => {
  try {
    const { token, email, password, confirm_password, name, username } = req.body;

    if (!token || !email || !password || !confirm_password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get all organizations
    const organizations = await getListTrainingOrganizations();

    // Find the organization and trainer with the matching email and token
    let org = null;
    let trainer = null;

    for (const organization of organizations) {
      const matchingTrainer = organization.trainers.find(
        (t) =>
          t.email.toLowerCase() === email.toLowerCase() &&
          !t.activatedAt &&
          t.invitationToken !== undefined,
      );

      if (matchingTrainer) {
        // Verify the token using bcrypt
        const isValidToken = bcrypt.compareSync(token, matchingTrainer.invitationToken);
        if (isValidToken) {
          org = organization;
          trainer = matchingTrainer;
          break;
        }
      }
    }

    if (!org || !trainer) {
      return res.status(404).json({ error: 'Invalid or expired invitation token' });
    }

    // Check if the invitation has expired
    if (trainer.invitationExpires && new Date(trainer.invitationExpires) < new Date()) {
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
      role: [SystemRoles.TRAINER],
    });

    if (registerResult.status !== 200) {
      return res.status(registerResult.status).json({ error: registerResult.message });
    }

    // Find the newly created user
    const user = await findUser({ email });
    if (!user) {
      return res.status(500).json({ error: 'Failed to create user account' });
    }

    // Update the trainer in the training organization
    const updatedOrg = await updateTrainingOrganizationTrainer(org._id, email, {
      userId: user._id,
      activatedAt: new Date(),
    });

    if (!updatedOrg) {
      return res.status(500).json({ error: 'Failed to update trainer status' });
    }

    res.status(200).json({
      message: 'Invitation accepted successfully',
    });
  } catch (error) {
    logger.error(
      '[/training-organizations/accept-trainer-invitation] Error accepting invitation',
      error,
    );
    res.status(500).json({ error: error.message });
  }
};

/**
 * Removes a trainer from a training organization.
 * @route DELETE /training-organizations/:id/trainers/:email
 * @param {ServerRequest} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.id - The ID of the training organization.
 * @param {string} req.params.email - The email of the trainer to remove.
 * @param {ServerResponse} res - The response object.
 * @returns {Object} 200 - success response - application/json
 */
const removeTrainerHandler = async (req, res) => {
  try {
    const { id, email } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Missing organization ID' });
    }
    if (!email) {
      return res.status(400).json({ error: 'Missing trainer email' });
    }

    const trainingOrganization = await getTrainingOrganizationById(id);
    if (!trainingOrganization) {
      return res.status(404).json({ error: 'Training organization not found' });
    }

    const trainerExists = trainingOrganization.trainers.some(
      (trainer) => trainer.email.toLowerCase() === email.toLowerCase(),
    );
    if (!trainerExists) {
      return res.status(404).json({ error: 'Trainer not found in this organization' });
    }

    const result = await TrainingOrganization.updateOne(
      { _id: id },
      { $pull: { trainers: { email: { $regex: new RegExp('^' + email + '$', 'i') } } } },
    );
    if (result.modifiedCount === 0) {
      logger.error(`Failed to update training organization ${id}`);
      return res.status(500).json({ error: 'Failed to update training organization' });
    }

    const updatedOrg = await getTrainingOrganizationById(id);
    res.status(200).json(updatedOrg);
  } catch (error) {
    logger.error(
      `[/training-organizations/${req.params.id}/trainers/${req.params.email}] Error removing trainer`,
      error,
    );
    res.status(500).json({ error: error.message });
  }
};

/**
 * Retrieves active administrators and trainers of a training organization.
 * @route GET /training-organizations/:id/active-members
 * @param {ServerRequest} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.id - The ID of the training organization.
 * @param {ServerResponse} res - The response object.
 * @returns {Object} 200 - success response - application/json
 */
const getActiveOrganizationMembersHandler = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Missing organization ID' });
    }

    const trainingOrganization = await getTrainingOrganizationById(id);

    if (!trainingOrganization) {
      return res.status(404).json({ error: 'Training organization not found' });
    }

    const activeAdministrators = await Promise.all(
      trainingOrganization.administrators
        .filter((admin) => admin.userId) // Only process active admins with userId
        .map(async (admin) => await findUser({ _id: admin.userId })),
    );

    const activeTrainers = await Promise.all(
      trainingOrganization.trainers
        .filter((trainer) => trainer.userId) // Only process active trainers with userId
        .map(async (trainer) => await findUser({ _id: trainer.userId })),
    );

    return res.json({
      activeAdministrators: activeAdministrators,
      activeTrainers: activeTrainers,
    });
  } catch (error) {
    logger.error(
      `[/training-organizations/${req.params.id}/active-members] Error retrieving active members`,
      error,
    );
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createTrainingOrganization: createTrainingOrganizationHandler,
  getListTrainingOrganizations: getListTrainingOrganizationsHandler,
  acceptAdminInvitation: acceptAdminInvitationHandler,
  acceptTrainerInvitation: acceptTrainerInvitationHandler,
  deleteTrainingOrganization: deleteTrainingOrganizationHandler,
  getTrainingOrganizationById: getTrainingOrganizationByIdHandler,
  addAdministrator: addAdministratorHandler,
  removeAdministrator: removeAdministratorHandler,
  addTrainer: addTrainerHandler,
  removeTrainer: removeTrainerHandler,
  getActiveOrganizationMembers: getActiveOrganizationMembersHandler,
};
