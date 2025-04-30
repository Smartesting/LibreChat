const { findUser } = require('~/models/userMethods');
const { sendEmail, checkEmailConfig } = require('~/server/utils');
const { logger } = require('~/config');
const {
  createAdminInvitation,
  findPendingAdminInvitationByEmail,
} = require('~/models/AdminInvitation');

/**
 * Process an admin invitation
 * @param {string} email - The email to invite
 * @returns {Promise<Object>} - The result of the invitation process
 */
const processAdminInvitation = async (email) => {
  try {
    // Check if email is valid
    if (!email || !email.match(/\S+@\S+\.\S+/)) {
      return {
        success: false,
        status: 400,
        message: 'Invalid email address',
      };
    }

    // Check if user already exists
    const existingUser = await findUser({ email }, 'email _id role');

    if (existingUser) {
      return {
        success: false,
        status: 400,
        message: 'A user with this email already exists',
      };
    }

    // Check if there's already a pending invitation for this email
    const existingInvitation = await findPendingAdminInvitationByEmail(email);

    if (existingInvitation) {
      return {
        success: false,
        status: 400,
        message: 'An invitation has already been sent to this email',
      };
    }

    // Create a new invitation
    const { invitation, token } = await createAdminInvitation({
      email,
    });

    // Send invitation email
    await sendAdminInvitationEmail(email, token);

    return {
      success: true,
      status: 201,
      message: 'Invitation sent successfully',
      invitation,
    };
  } catch (error) {
    logger.error('[processAdminInvitation] Error processing admin invitation', error);
    return {
      success: false,
      status: 500,
      message: 'Error processing invitation',
    };
  }
};

/**
 * Send invitation email to new admin
 * @param {string} email - The email address to send the invitation to
 * @param {string} token - The invitation token
 * @returns {Promise<void>}
 */
const sendAdminInvitationEmail = async (email, token) => {
  try {
    const inviteLink = `${process.env.DOMAIN_CLIENT}/admin-invite?token=${token}&email=${encodeURIComponent(email)}`;

    // Check if email configuration is available
    if (!checkEmailConfig()) {
      logger.info(`[sendAdminInvitationEmail] Email configuration not available. Cannot send invitation to [Email: ${email}] [inviteLink: ${inviteLink}]`);
      return;
    }

    await sendEmail({
      email,
      subject: 'Invitation to join as an Administrator',
      payload: {
        appName: process.env.APP_TITLE || 'LibreChat',
        name: email,
        inviteLink,
      },
      template: 'adminInvite.handlebars',
    });

    logger.info(`[sendAdminInvitationEmail] Invitation sent. [Email: ${email}] [inviteLink: ${inviteLink}]`);
  } catch (error) {
    logger.error(`[sendAdminInvitationEmail] Error sending invitation: ${error.message}`);
  }
};

module.exports = {
  processAdminInvitation,
  sendAdminInvitationEmail,
};
