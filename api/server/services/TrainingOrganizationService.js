const { webcrypto } = require('node:crypto');
const bcrypt = require('bcryptjs');
const { findUser } = require('~/models/userMethods');
const { sendEmail, checkEmailConfig } = require('~/server/utils');
const { logger } = require('~/config');

/**
 * Creates Token and corresponding Hash for verification
 * @returns {[string, string]}
 */
const createTokenHash = () => {
  const token = Buffer.from(webcrypto.getRandomValues(new Uint8Array(32))).toString('hex');
  const hash = bcrypt.hashSync(token, 10);
  return [token, hash];
};

/**
 * Process administrators for a training organization
 * @param {Array} administrators - Array of administrator emails
 * @param {string} orgName - The name of the training organization
 * @returns {Promise<Array>} - Array of processed administrator objects
 */
const processAdministrators = async (administrators, orgName) => {
  if (!administrators || !Array.isArray(administrators)) {
    return [];
  }

  // Remove duplicate administrators
  const uniqueAdministrators = Array.from(new Set(administrators.map(email => email.toLowerCase())));

  const processedAdmins = [];

  for (const email of uniqueAdministrators) {
    // Check if user exists
    const existingUser = await findUser({ email }, 'email _id name username');

    if (existingUser) {
      // User exists, set status to active
      processedAdmins.push({
        email,
        userId: existingUser._id,
        status: 'active',
        activatedAt: new Date(),
      });

      // Send notification email to existing user
      await sendNotificationEmail(existingUser, orgName);
    } else {
      // User doesn't exist, generate invitation token
      const [invitationToken, tokenHash] = createTokenHash();
      const invitationExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      processedAdmins.push({
        email,
        invitationToken: tokenHash,
        invitationExpires,
        status: 'invited',
        invitedAt: new Date(),
      });

      // Send invitation email
      await sendInvitationEmail(email, invitationToken, orgName);
    }
  }

  return processedAdmins;
};

/**
 * Send notification email to existing user
 * @param {Object} user - User object with email, name, and username
 * @param {string} orgName - The name of the training organization
 * @returns {Promise<void>}
 */
const sendNotificationEmail = async (user, orgName) => {
  try {
    const loginLink = `${process.env.DOMAIN_CLIENT}/login`;

    // Check if email configuration is available
    if (!checkEmailConfig()) {
      logger.info(`[sendNotificationEmail] Email configuration not available. Cannot send notification to [Email: ${user.email}] [Org: ${orgName}] [loginLink: ${loginLink}]`);
      return;
    }

    await sendEmail({
      email: user.email,
      subject: `You are now an administrator of ${orgName}`,
      payload: {
        appName: process.env.APP_TITLE || 'LibreChat',
        name: user.name || user.username || user.email,
        orgName,
        loginLink,
      },
      template: 'adminNotification.handlebars',
    });

    logger.info(`[sendNotificationEmail] Admin notification sent. [Email: ${user.email}] [Org: ${orgName}] [loginLink: ${loginLink}]`);
  } catch (error) {
    logger.error(`[sendNotificationEmail] Error sending notification: ${error.message}`);
  }
};

/**
 * Send invitation email to new administrator
 * @param {string} email - The email address to send the invitation to
 * @param {string} token - The invitation token
 * @param {string} orgName - The name of the training organization
 * @returns {Promise<void>}
 */
const sendInvitationEmail = async (email, token, orgName) => {
  try {
    const inviteLink = `${process.env.DOMAIN_CLIENT}/org-admin-invite?token=${token}&email=${encodeURIComponent(email)}&orgName=${encodeURIComponent(orgName)}`;

    // Check if email configuration is available
    if (!checkEmailConfig()) {
      logger.info(`[sendInvitationEmail] Email configuration not available. Cannot send invitation to [Email: ${email}] [Org: ${orgName}] [inviteLink: ${inviteLink}]`);
      return;
    }

    await sendEmail({
      email,
      subject: `Invitation to join ${orgName} as an administrator`,
      payload: {
        appName: process.env.APP_TITLE || 'LibreChat',
        name: email,
        orgName: orgName,
        inviteLink,
      },
      template: 'orgAdminInvite.handlebars',
    });

    logger.info(`[sendInvitationEmail] Invitation sent. [Email: ${email}] [Org: ${orgName}] [inviteLink: ${inviteLink}]`);
  } catch (error) {
    logger.error(`[sendInvitationEmail] Error sending invitation: ${error.message}`);
  }
};

module.exports = {
  processAdministrators,
  sendNotificationEmail,
  sendInvitationEmail,
};
