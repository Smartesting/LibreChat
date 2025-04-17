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

module.exports = {
  TrainingOrganization,
  createTrainingOrganization,
  getListTrainingOrganizations,
};
