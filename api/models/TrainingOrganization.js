const mongoose = require('mongoose');
const { trainingOrganizationSchema } = require('@librechat/data-schemas');

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
  // If no user is provided or user is an admin, return all organizations
  if (!user || user.role === 'ADMIN') {
    return (await TrainingOrganization.find({}).lean());
  }

  // Otherwise, return only organizations where the user is an active administrator
  return (await TrainingOrganization.find({
    'administrators': {
      $elemMatch: {
        'userId': user.id,
        'status': 'active',
      },
    },
  }).lean());
};

/**
 * Update an administrator in a training organization
 * @param {string} orgId - The ID of the training organization
 * @param {string} email - The email of the administrator to update
 * @param {Object} updateData - The data to update
 * @returns {Promise<Object|null>} The updated training organization document or null if not found
 */
const updateTrainingOrganizationAdmin = async (orgId, email, updateData) => {
  return (await TrainingOrganization.findOneAndUpdate(
    {
      _id: orgId,
      'administrators.email': email,
    },
    {
      $set: {
        'administrators.$.userId': updateData.userId,
        'administrators.$.status': updateData.status,
        'administrators.$.activatedAt': updateData.activatedAt,
        'administrators.$.invitationToken': null,
        'administrators.$.invitationExpires': null,
      },
    },
    { new: true },
  ).lean());
};

/**
 * Update a trainer in a training organization
 * @param {string} orgId - The ID of the training organization
 * @param {string} email - The email of the trainer to update
 * @param {Object} updateData - The data to update
 * @returns {Promise<Object|null>} The updated training organization document or null if not found
 */
const updateTrainingOrganizationTrainer = async (orgId, email, updateData) => {
  return (await TrainingOrganization.findOneAndUpdate(
    {
      _id: orgId,
      'trainers.email': email,
    },
    {
      $set: {
        'trainers.$.userId': updateData.userId,
        'trainers.$.status': updateData.status,
        'trainers.$.activatedAt': updateData.activatedAt,
        'trainers.$.invitationToken': null,
        'trainers.$.invitationExpires': null,
      },
    },
    { new: true },
  ).lean());
};

/**
 * Delete a training organization by ID
 * @param {string} orgId - The ID of the training organization to delete
 * @returns {Promise<Object|null>} The deleted training organization document or null if not found
 */
const deleteTrainingOrganization = async (orgId) => {
  return (await TrainingOrganization.findByIdAndDelete(orgId).lean());
};

/**
 * Get a training organization by ID
 * @param {string} orgId - The ID of the training organization to retrieve
 * @returns {Promise<Object|null>} The training organization document or null if not found
 */
const getTrainingOrganizationById = async (orgId) => {
  return (await TrainingOrganization.findById(orgId).lean());
};

module.exports = {
  TrainingOrganization,
  createTrainingOrganization,
  getListTrainingOrganizations,
  updateTrainingOrganizationAdmin,
  updateTrainingOrganizationTrainer,
  deleteTrainingOrganization,
  getTrainingOrganizationById,
};
