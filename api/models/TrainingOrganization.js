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
 * Get all training organizations.
 * @returns {Promise<TrainingOrganization[]>} A promise that resolves to an array of training organizations.
 */
const getListTrainingOrganizations = async () => {
  return (await TrainingOrganization.find({}).lean());
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

module.exports = {
  TrainingOrganization,
  createTrainingOrganization,
  getListTrainingOrganizations,
  updateTrainingOrganizationAdmin,
};
