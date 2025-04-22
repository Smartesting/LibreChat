const { logger } = require('~/config');
const {
  createTrainingOrganization,
  getListTrainingOrganizations,
} = require('~/models/TrainingOrganization');

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
    const trainingOrganization = await createTrainingOrganization(req.body);
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

module.exports = {
  createTrainingOrganization: createTrainingOrganizationHandler,
  getListTrainingOrganizations: getListTrainingOrganizationsHandler,
};
