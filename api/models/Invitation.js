const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { logger } = require('~/config');
const { invitationSchema } = require('@librechat/data-schemas');
const { webcrypto } = require('node:crypto');

const Invitation = mongoose.model('Invitation', invitationSchema);

/**
 * Creates a new super admin invitation
 * @param {string} email - The email to invite
 * @returns {Promise<Object>} - The created invitation and the plain token
 */
const createSuperAdminInvitation = async (email) => {
  try {
    // Generate a random token
    const token = Buffer.from(webcrypto.getRandomValues(new Uint8Array(32))).toString('hex');
    const tokenHash = bcrypt.hashSync(token, 10);

    const existingInvitation = await Invitation.findOne({ email });
    let invitation;

    if (existingInvitation) {
      // Update the existing invitation
      invitation = await Invitation.findOneAndUpdate(
        { email },
        {
          $set: {
            'roles.superAdmin': true,
          },
          $push: {
            invitationTokens: tokenHash,
          },
        },
        { new: true },
      );
    } else {
      // Create the invitation
      invitation = await Invitation.create({
        email,
        invitationTokens: [tokenHash],
        roles: {
          superAdmin: true,
          orgAdmin: [],
          orgTrainer: [],
        },
      });
    }

    return { invitation, token };
  } catch (error) {
    logger.error('[createSuperAdminInvitation] Error creating admin invitation', error);
    throw error;
  }
};

/**
 * Finds a super admin invitation by email
 * @param {string} email - The email to search for
 * @returns {Promise<Object|null>} - The found invitation or null if not found
 */
const findSuperAdminInvitationByEmail = async (email) => {
  try {
    return await Invitation.findOne({
      email,
      'roles.superAdmin': true,
    });
  } catch (error) {
    logger.error('[findSuperAdminInvitationByEmail] Error finding pending admin invitation', error);
    throw error;
  }
};

/**
 * Finds an invitation by email and token
 * @param {string} email - The email to search for
 * @param {string} token - The plain token to verify
 * @returns {Promise<Object|null>} - The found invitation or null if not found
 */
const findInvitationByEmailAndToken = async (email, token) => {
  try {
    const invitation = await Invitation.findOne({
      email,
    });

    if (!invitation || !invitation.invitationTokens) {
      return null;
    }

    // Verify the token using bcrypt
    const validToken = invitation.invitationTokens.find((invitationToken) =>
      bcrypt.compareSync(token, invitationToken),
    );

    if (!validToken) {
      return null;
    }

    return invitation;
  } catch (error) {
    logger.error('[findInvitationByEmailAndToken] Error finding invitation', error);
    throw error;
  }
};

const deleteInvitationById = async (invitationId) => {
  try {
    await Invitation.deleteOne({ _id: invitationId });
  } catch (error) {
    logger.error('[deleteInvitationById] Error deleting invitation', error);
    throw error;
  }
};

module.exports = {
  createSuperAdminInvitation,
  findSuperAdminInvitationByEmail,
  findInvitationByEmailAndToken,
  deleteInvitationById,
};
