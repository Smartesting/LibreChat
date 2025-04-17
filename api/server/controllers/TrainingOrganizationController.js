const { logger } = require('~/config');
const { createTrainingOrganization } = require('~/models/TrainingOrganization');

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
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createTrainingOrganization: createTrainingOrganizationHandler,
};
