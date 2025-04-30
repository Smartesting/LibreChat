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
    logger.error('[findPendingAdminInvitationByEmail] Error finding pending admin invitation', error);
    throw error;
  }
};

module.exports = {
  createAdminInvitation,
  findPendingAdminInvitationByEmail,
};
