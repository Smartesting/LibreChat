const mongoose = require('mongoose');
const { webcrypto } = require('node:crypto');
const bcrypt = require('bcryptjs');
const { logger } = require('~/config');
const adminInvitationSchema = require('@librechat/data-schemas');

const AdminInvitation = mongoose.model('AdminInvitation', adminInvitationSchema);

/**
 * Creates a new admin invitation
 * @param {Object} invitationData - The invitation data
 * @param {string} invitationData.email - The email to invite
 * @param {string} invitationData.invitedBy - The user ID of the inviter
 * @param {string} invitationData.role - The role to assign
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
      invitedBy: invitationData.invitedBy,
    });

    return { invitation, token };
  } catch (error) {
    logger.error('[createAdminInvitation] Error creating admin invitation', error);
    throw error;
  }
};

module.exports = {
  createAdminInvitation,
};
