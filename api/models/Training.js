const mongoose = require('mongoose');
const { trainingSchema, userSchema } = require('@librechat/data-schemas');
const { TrainingStatus } = require('librechat-data-provider');
const User = mongoose.model('user', userSchema);
const Training = mongoose.model('training', trainingSchema);

/**
 * Create a training with the provided data.
 * @param {Object} trainingData - The training data to create.
 * @returns {Promise<Training>} The created training document as a plain object.
 * @throws {Error} If the creation of the training fails.
 */
const createTraining = async (trainingData) => {
  if (trainingData.trainers && Array.isArray(trainingData.trainers)) {
    const trainerEmails = trainingData.trainers;
    if (trainerEmails.length > 0 && typeof trainerEmails[0] === 'string') {
      const users = await User.find({ email: { $in: trainerEmails } }).lean();
      const emailToIdMap = users.reduce((map, user) => {
        map[user.email] = user._id;
        return map;
      }, {});

      trainingData.trainers = trainerEmails.map((email) => emailToIdMap[email]).filter((id) => id);
    }
  }

  return (await Training.create(trainingData)).toObject();
};

/**
 * Get all trainings for a specific training organization.
 * @param {string} trainingOrganizationId - The ID of the training organization.
 * @returns {Promise<Training[]>} A promise that resolves to an array of trainings.
 */
const getTrainingsByOrganization = async (trainingOrganizationId) => {
  const trainings = await Training.find({ trainingOrganizationId }).lean();

  if (trainings.length > 0) {
    const allTrainerIds = trainings.reduce((ids, training) => {
      if (training.trainers && training.trainers.length > 0) {
        ids.push(...training.trainers);
      }
      return ids;
    }, []);

    if (allTrainerIds.length > 0) {
      const users = await User.find({ _id: { $in: allTrainerIds } }).lean();

      const idToEmailMap = users.reduce((map, user) => {
        map[user._id.toString()] = user.email;
        return map;
      }, {});

      trainings.forEach((training) => {
        if (training.trainers && training.trainers.length > 0) {
          training.trainers = training.trainers
            .map((id) => idToEmailMap[id.toString()])
            .filter((email) => email);
        }
      });
    }
  }

  return trainings;
};

/**
 * Get a training by ID
 * @param {string} trainingId - The ID of the training to retrieve
 * @returns {Promise<Object|null>} The training document or null if not found
 */
const getTrainingById = async (trainingId) => {
  const training = await Training.findById(trainingId).lean();

  if (training && training.trainers && training.trainers.length > 0) {
    const trainerIds = training.trainers;
    const users = await User.find({ _id: { $in: trainerIds } }).lean();

    training.trainers = users.map((user) => user.email);
  }

  return training;
};

/**
 * Update a training by ID
 * @param {string} trainingId - The ID of the training to update
 * @param {Object} updateData - The data to update
 * @returns {Promise<Object|null>} The updated training document or null if not found
 */
const updateTraining = async (trainingId, updateData) => {
  if (updateData.trainers && Array.isArray(updateData.trainers)) {
    const trainerEmails = updateData.trainers;
    if (trainerEmails.length > 0 && typeof trainerEmails[0] === 'string') {
      const users = await User.find({ email: { $in: trainerEmails } }).lean();

      const emailToIdMap = users.reduce((map, user) => {
        map[user.email] = user._id;
        return map;
      }, {});

      updateData.trainers = trainerEmails.map((email) => emailToIdMap[email]).filter((id) => id);
    }
  }

  return Training.findByIdAndUpdate(trainingId, updateData, { new: true }).lean();
};

/**
 * Delete a training by ID
 * @param {string} trainingId - The ID of the training to delete
 * @returns {Promise<Object|null>} The deleted training document or null if not found
 */
const deleteTraining = async (trainingId) => {
  return Training.findByIdAndDelete(trainingId).lean();
};

/**
 * Get ongoing trainings
 * @returns {Promise<Training[]|null>}
 */
const getOngoingTrainings = async () => {
  const trainings = await Training.find().lean();
  const trainingsWithStatus = trainings.map((training) => {
    const status = calculateTrainingStatus(training.startDateTime, training.endDateTime);
    return { ...training, status };
  });

  return trainingsWithStatus.filter((training) => training.status === TrainingStatus.IN_PROGRESS);
};

/**
 * Calculate the training status given its start and end times.
 * @param startDateTime
 * @param endDateTime
 * @returns {TrainingStatus}
 */
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

module.exports = {
  Training,
  createTraining,
  getTrainingsByOrganization,
  getTrainingById,
  updateTraining,
  deleteTraining,
  calculateTrainingStatus,
  getOngoingTrainings,
};
