const mongoose = require('mongoose');
const { trainingOrganizationSchema } = require('@librechat/data-schemas');
const { SystemRoles } = require('librechat-data-provider');
const { logger } = require('~/config');

const TrainingOrganization = mongoose.model('trainingOrganization', trainingOrganizationSchema);

/**
 * Create a training organization with the provided data.
 * @param {Object} trainingOrgData - The training organization data to create.
 * @returns {Promise<TrainingOrganization>} The created training organization document as a plain object.
 * @throws {Error} If the creation of the training organization fails.
 */
const createTrainingOrganization = async (trainingOrgData) => {
  return (await TrainingOrganization.create(trainingOrgData)).toObject();
};

/**
 * Get all training organizations that the user can administer.
 * @param {Object} [user] - The user object. If provided, returns only organizations the user can administer.
 * @returns {Promise<TrainingOrganization[]>} A promise that resolves to an array of training organizations.
 */
const getListTrainingOrganizations = async (user) => {
  if (!user || user.role.includes(SystemRoles.ADMIN)) {
    return TrainingOrganization.find({}).lean();
  }

  if (user.role.includes(SystemRoles.TRAINER)) {
    return TrainingOrganization.find({
      trainers: {
        $elemMatch: {
          userId: user.id,
          activatedAt: { $exists: true },
        },
      },
    }).lean();
  }

  return [];
};

/**
 * Update an administrator in a training organization
 * @param {string} orgId - The ID of the training organization
 * @param {string} email - The email of the administrator to update
 * @param {Object} updateData - The data to update
 * @returns {Promise<Object|null>} The updated training organization document or null if not found
 */
const updateTrainingOrganizationAdmin = async (orgId, email, updateData) => {
  return await TrainingOrganization.findOneAndUpdate(
    {
      _id: orgId,
      'administrators.email': email,
    },
    {
      $set: {
        'administrators.$.userId': updateData.userId,
        'administrators.$.activatedAt': updateData.activatedAt,
      },
      $unset: {
        'administrators.$.invitationToken': '',
        'administrators.$.invitationExpires': '',
      },
    },
    { new: true },
  ).lean();
};

/**
 * Update a trainer in a training organization
 * @param {string} orgId - The ID of the training organization
 * @param {string} email - The email of the trainer to update
 * @param {Object} updateData - The data to update
 * @returns {Promise<Object|null>} The updated training organization document or null if not found
 */
const updateTrainingOrganizationTrainer = async (orgId, email, updateData) => {
  return await TrainingOrganization.findOneAndUpdate(
    {
      _id: orgId,
      'trainers.email': email,
    },
    {
      $set: {
        'trainers.$.userId': updateData.userId,
        'trainers.$.activatedAt': updateData.activatedAt,
      },
      $unset: {
        'trainers.$.invitationToken': '',
        'trainers.$.invitationExpires': '',
      },
    },
    { new: true },
  ).lean();
};

/**
 * Delete a training organization by ID
 * @param {string} orgId - The ID of the training organization to delete
 * @returns {Promise<Object|null>} The deleted training organization document or null if not found
 */
const deleteTrainingOrganization = async (orgId) => {
  return await TrainingOrganization.findByIdAndDelete(orgId).lean();
};

/**
 * Get a training organization by ID
 * @param {string} orgId - The ID of the training organization to retrieve
 * @returns {Promise<Object|null>} The training organization document or null if not found
 */
const getTrainingOrganizationById = async (orgId) => {
  return await TrainingOrganization.findById(orgId).lean();
};

/**
 * Add a new administrator to a training organization
 * @param {string} orgId - The ID of the training organization
 * @param {string} userId - The user ID of the administrator to add
 * @param {string} userEmail - The email of the administrator to add
 * @returns {Promise<Object|null>} The updated training organization document or null if error occurs
 */
const addAdminToOrganization = async (orgId, userId, userEmail) => {
  try {
    return await TrainingOrganization.findOneAndUpdate(
      { _id: orgId },
      {
        $push: {
          administrators: {
            userId: userId,
            email: userEmail,
            activatedAt: new Date(),
          },
        },
      },
    );
  } catch (error) {
    logger.error(`[addAdminToOrganization] Error adding user ${userEmail} as admin to organization ${orgId}:`, error);
    throw error;
  }
};

/**
 * Add a new trainer to a training organization
 * @param {string} orgId - The ID of the training organization
 * @param {string} userId - The user ID of the trainer to add
 * @param {string} userEmail - The email of the trainer to add
 * @returns {Promise<Object|null>} The updated training organization document or null if error occurs
 */
const addTrainerToOrganization = async (orgId, userId, userEmail) => {
  try {
    return await TrainingOrganization.findOneAndUpdate(
      { _id: orgId },
      {
        $push: {
          trainers: {
            userId: userId,
            email: userEmail,
            activatedAt: new Date(),
          },
        },
      },
    );
  } catch (error) {
    logger.error(`[addTrainerToOrganization] Error adding user ${userEmail} as trainer to organization ${orgId}:`, error);
    throw error;
  }
};

module.exports = {
  TrainingOrganization,
  createTrainingOrganization,
  getListTrainingOrganizations,
  updateTrainingOrganizationAdmin,
  updateTrainingOrganizationTrainer,
  deleteTrainingOrganization,
  getTrainingOrganizationById,
  addAdminToOrganization,
  addTrainerToOrganization,
};
