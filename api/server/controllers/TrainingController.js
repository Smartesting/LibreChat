const {
  createTraining,
  getTrainingsByOrganization,
  getTrainingById,
  updateTraining,
  deleteTraining,
} = require('../../models/Training');
const { TrainingStatus } = require('librechat-data-provider');

/**
 * Create a new training
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response
 */
const create = async (req, res) => {
  try {
    const trainingData = req.body;

    if (!trainingData.trainingOrganizationId) {
      return res.status(400).json({ error: 'Training organization ID is required' });
    }

    const training = await createTraining(trainingData);
    return res.status(201).json(training);
  } catch (error) {
    console.error('Error creating training:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get all trainings for a specific organization
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response
 */
const getByOrganization = async (req, res) => {
  try {
    const { organizationId } = req.params;

    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const trainings = await getTrainingsByOrganization(organizationId);
    const trainingsWithStatus = trainings.map((training) => {
      const status = calculateTrainingStatus(training.startDateTime, training.endDateTime);
      return { ...training, status };
    });

    return res.status(200).json(trainingsWithStatus);
  } catch (error) {
    console.error('Error getting trainings:', error);
    return res.status(500).json({ error: error.message });
  }
};

const calculateTrainingStatus = (startDateTime, endDateTime) => {
  const now = new Date();
  const start = new Date(startDateTime);
  const end = new Date(endDateTime);

  if (now < start) {
    return TrainingStatus.UPCOMING;
  } else if (now >= start && now <= end) {
    return TrainingStatus.IN_PROGRESS;
  } else {
    return TrainingStatus.PAST;
  }
};

/**
 * Get a training by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response
 */
const getById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Training ID is required' });
    }

    const training = await getTrainingById(id);

    if (!training) {
      return res.status(404).json({ error: 'Training not found' });
    }

    return res.status(200).json(training);
  } catch (error) {
    console.error('Error getting training:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Update a training
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Training ID is required' });
    }

    const training = await updateTraining(id, updateData);

    if (!training) {
      return res.status(404).json({ error: 'Training not found' });
    }

    return res.status(200).json(training);
  } catch (error) {
    console.error('Error updating training:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Delete a training
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response
 */
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Training ID is required' });
    }

    const training = await deleteTraining(id);

    if (!training) {
      return res.status(404).json({ error: 'Training not found' });
    }

    return res.status(200).json({ message: 'Training deleted successfully' });
  } catch (error) {
    console.error('Error deleting training:', error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  create,
  getByOrganization,
  getById,
  update,
  remove,
};
