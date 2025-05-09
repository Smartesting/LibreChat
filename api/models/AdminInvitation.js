const mongoose = require('mongoose');
const { webcrypto } = require('node:crypto');
const bcrypt = require('bcryptjs');
const { logger } = require('~/config');
const { adminInvitationSchema } = require('@librechat/data-schemas');

const AdminInvitation = mongoose.model('AdminInvitation', adminInvitationSchema);

/**
 * Creates a new admin invitation
 * @param {Object} invitationData - The invitation data
 * @param {string} invitationData.email - The email to invite
 * @returns {Promise<Object>} - The created invitation and the plain token
 */
const createAdminInvitation = async (invitationData) => {
  try {
    // Generate a random token
    const token = Buffer.from(webcrypto.getRandomValues(new Uint8Array(32))).toString('hex');
    const tokenHash = bcrypt.hashSync(token, 10);

    // Set expiration to 7 days from now
    const invitationExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Create the invitation
    const invitation = await AdminInvitation.create({
      email: invitationData.email,
      invitationToken: tokenHash,
      invitationExpires,
    });

    return { invitation, token };
  } catch (error) {
    logger.error('[createAdminInvitation] Error creating admin invitation', error);
    throw error;
  }
};

/**
 * Finds a pending admin invitation by email (not accepted and not expired)
 * @param {string} email - The email to search for
 * @returns {Promise<Object|null>} - The found pending invitation or null if not found
 */
const findPendingAdminInvitationByEmail = async (email) => {
  try {
    const now = new Date();
    return await AdminInvitation.findOne({
      email,
      acceptedAt: { $exists: false },
      invitationExpires: { $gt: now },
    });
  } catch (error) {
    logger.error(
      '[findPendingAdminInvitationByEmail] Error finding pending admin invitation',
      error,
    );
    throw error;
  }
};

/**
 * Finds a pending admin invitation by email and token
 * @param {string} email - The email to search for
 * @param {string} token - The plain token to verify
 * @returns {Promise<Object|null>} - The found pending invitation or null if not found
 */
const findPendingAdminInvitationByEmailAndToken = async (email, token) => {
  try {
    const now = new Date();
    const invitation = await AdminInvitation.findOne({
      email,
      acceptedAt: { $exists: false },
      invitationExpires: { $gt: now },
    });

    if (!invitation || !invitation.invitationToken) {
      return null;
    }

    // Verify the token using bcrypt
    const isValidToken = bcrypt.compareSync(token, invitation.invitationToken);
    if (!isValidToken) {
      return null;
    }

    return invitation;
  } catch (error) {
    logger.error(
      '[findPendingAdminInvitationByEmailAndToken] Error finding pending admin invitation',
      error,
    );
    throw error;
  }
};

/**
 * Updates an admin invitation to mark it as accepted
 * @param {string} invitationId - The ID of the invitation to update
 * @returns {Promise<Object|null>} - The updated invitation or null if not found
 */
const updateAdminInvitationAsAccepted = async (invitationId) => {
  try {
    return await AdminInvitation.findByIdAndUpdate(
      invitationId,
      {
        acceptedAt: new Date(),
      },
      { new: true },
    );
  } catch (error) {
    logger.error('[updateAdminInvitationAsAccepted] Error updating admin invitation', error);
    throw error;
  }
};

/**
 * Finds all pending admin invitations (not accepted and not expired)
 * @returns {Promise<Array>} - Array of pending admin invitations
 */
const findAllPendingAdminInvitations = async () => {
  try {
    const now = new Date();
    return await AdminInvitation.find({
      acceptedAt: { $exists: false },
      invitationExpires: { $gt: now },
    }).sort({ createdAt: -1 });
  } catch (error) {
    logger.error('[findAllPendingAdminInvitations] Error finding pending admin invitations', error);
    throw error;
  }
};

/**
 * Deletes an admin invitation by ID
 * @param {string} invitationId - The ID of the invitation to delete
 * @returns {Promise<Object>} - The deletion result
 */
const deleteAdminInvitationById = async (invitationId) => {
  try {
    await AdminInvitation.deleteOne({ _id: invitationId });
  } catch (error) {
    logger.error('[deleteAdminInvitationById] Error deleting admin invitation', error);
    throw error;
  }
};

module.exports = {
  createAdminInvitation,
  findPendingAdminInvitationByEmail,
  findPendingAdminInvitationByEmailAndToken,
  updateAdminInvitationAsAccepted,
  findAllPendingAdminInvitations,
  deleteAdminInvitationById,
};
