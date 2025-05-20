const {
  createTraining,
  getTrainingsByOrganization,
  getTrainingById,
  updateTraining,
  deleteTraining,
} = require('../../models/Training');
const { generateTraineeUsers, deleteUserById } = require('../../models/userMethods');
const { findUser } = require('~/models/userMethods');
const { calculateTrainingStatus } = require('~/models/Training');

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

    if (!trainingData.trainees) {
      trainingData.trainees = [];
    }

    if (trainingData.participantCount && Number(trainingData.participantCount) > 0) {
      const count = Number(trainingData.participantCount);

      const generatedUsers = await generateTraineeUsers(count);

      const trainees = generatedUsers.map((user) => ({
        username: user.email,
        password: user.password,
        hasLoggedIn: false,
      }));

      trainingData.trainees = [...trainingData.trainees, ...trainees];
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

/**
 * Adds a trainee to a training.
 * @route POST /trainings/:id/trainees
 * @param {ServerRequest} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.id - The ID of the training.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.username - The username of the trainee to add.
 * @param {ServerResponse} res - The response object.
 * @returns {Object} 200 - success response - application/json
 */
const addTrainee = async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Missing training ID' });
    }

    if (!username || username.trim() === '') {
      return res.status(400).json({ error: 'Invalid username' });
    }

    const training = await getTrainingById(id);

    if (!training) {
      return res.status(404).json({ error: 'Training not found' });
    }

    const existingTrainee =
      training.trainees &&
      training.trainees.find(
        (trainee) => trainee.username.toLowerCase() === username.toLowerCase(),
      );

    if (existingTrainee) {
      return res.status(400).json({ error: 'Trainee already exists in this training' });
    }

    const newTrainee = {
      username,
      hasLoggedIn: false,
    };

    const trainees = training.trainees || [];
    const updatedTraining = await updateTraining(id, {
      trainees: [...trainees, newTrainee],
    });

    if (!updatedTraining) {
      return res.status(500).json({ error: 'Failed to update training' });
    }

    res.status(200).json(updatedTraining);
  } catch (error) {
    console.error(`[/trainings/${req.params.id}/trainees] Error adding trainee`, error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Removes a trainee from a training.
 * @route DELETE /trainings/:id/trainees/:username
 * @param {ServerRequest} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.id - The ID of the training.
 * @param {string} req.params.username - The username of the trainee to remove.
 * @param {ServerResponse} res - The response object.
 * @returns {Object} 200 - success response - application/json
 */
const removeTrainee = async (req, res) => {
  try {
    const { id, username } = req.params;

    if (!id || !username) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const training = await getTrainingById(id);

    if (!training) {
      return res.status(404).json({ error: 'Training not found' });
    }

    const existingTrainee =
      training.trainees &&
      training.trainees.find(
        (trainee) => trainee.username.toLowerCase() === username.toLowerCase(),
      );

    if (!existingTrainee) {
      return res.status(404).json({ error: 'Trainee not found in this training' });
    }

    const updatedTrainees = training.trainees.filter(
      (trainee) => trainee.username.toLowerCase() !== username.toLowerCase(),
    );

    const updatedTraining = await updateTraining(id, { trainees: updatedTrainees });

    if (!updatedTraining) {
      return res.status(500).json({ error: 'Failed to update training' });
    }

    res.status(200).json(updatedTraining);
  } catch (error) {
    console.error(
      `[/trainings/${req.params.id}/trainees/${req.params.username}] Error removing trainee`,
      error,
    );
    res.status(500).json({ error: error.message });
  }
};

/**
 * Updates a trainee's login status in a training.
 * @route PATCH /trainings/:id/trainees/:username
 * @param {ServerRequest} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.id - The ID of the training.
 * @param {string} req.params.username - The username of the trainee to update.
 * @param {Object} req.body - The request body.
 * @param {boolean} req.body.hasLoggedIn - The new login status.
 * @param {ServerResponse} res - The response object.
 * @returns {Object} 200 - success response - application/json
 */
const updateTrainee = async (req, res) => {
  try {
    const { id, username } = req.params;
    const { hasLoggedIn } = req.body;

    if (!id || !username) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    if (hasLoggedIn === undefined) {
      return res.status(400).json({ error: 'Missing hasLoggedIn field' });
    }

    const training = await getTrainingById(id);

    if (!training) {
      return res.status(404).json({ error: 'Training not found' });
    }

    const traineeIndex =
      training.trainees &&
      training.trainees.findIndex(
        (trainee) => trainee.username.toLowerCase() === username.toLowerCase(),
      );

    if (traineeIndex === -1) {
      return res.status(404).json({ error: 'Trainee not found in this training' });
    }

    // Create a copy of the trainees array
    const updatedTrainees = [...training.trainees];

    // Update the specific trainee
    updatedTrainees[traineeIndex] = {
      ...updatedTrainees[traineeIndex],
      hasLoggedIn,
    };

    const updatedTraining = await updateTraining(id, { trainees: updatedTrainees });

    if (!updatedTraining) {
      return res.status(500).json({ error: 'Failed to update training' });
    }

    res.status(200).json(updatedTraining);
  } catch (error) {
    console.error(
      `[/trainings/${req.params.id}/trainees/${req.params.username}] Error updating trainee`,
      error,
    );
    res.status(500).json({ error: error.message });
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

    const currentTraining = await getTrainingById(id);
    if (!currentTraining) {
      return res.status(404).json({ error: 'Training not found' });
    }
    if (!updateData.trainees) {
      updateData.trainees = currentTraining.trainees || [];
    }

    if (updateData.participantCount && Number(updateData.participantCount) > 0) {
      const currentParticipantsCount = currentTraining.participantCount;
      const newCount = Number(updateData.participantCount);
      if (newCount > currentParticipantsCount) {
        const newGeneratedUsers = await generateTraineeUsers(newCount - currentParticipantsCount);
        const newTrainees = newGeneratedUsers.map((user) => ({
          username: user.email,
          password: user.password,
          hasLoggedIn: false,
        }));
        updateData.trainees = [...updateData.trainees, ...newTrainees];
      } else if (newCount < currentParticipantsCount) {
        for (const trainee of currentTraining.trainees.slice(newCount - currentParticipantsCount)) {
          const user = await findUser({ email: trainee.username });
          await deleteUserById(user._id);
        }
        updateData.trainees = currentTraining.trainees.slice(0, newCount);
      }
    } else if (Number(updateData.participantCount) === 0) {
      for (const trainee of currentTraining.trainees) {
        const user = await findUser({ email: trainee.username });
        await deleteUserById(user._id);
      }
      updateData.trainees = [];
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

    const trainingToDelete = await getTrainingById(id);
    if (!trainingToDelete) {
      return res.status(404).json({ error: 'Training not found' });
    }

    for (const trainee of trainingToDelete.trainees) {
      const user = await findUser({ email: trainee.username });
      await deleteUserById(user._id);
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
  addTrainee,
  removeTrainee,
  updateTrainee,
};
