const { logger } = require('~/config');
const { processAdminInvitation } = require('~/server/services/AdminInvitationService');

/**
 * Controller function to invite a new admin
 * @param {Object} req - Express request object with email in the body
 * @param {Object} res - Express response object
 */
const inviteAdminController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Process the invitation
    const result = await processAdminInvitation(email);

    if (!result.success) {
      return res.status(result.status).json({ message: result.message });
    }

    logger.info(`Admin invitation sent to ${email}`);
    res.status(result.status).json({ message: result.message });
  } catch (error) {
    logger.error('Error sending admin invitation:', error);
    res.status(500).json({ message: 'Error sending admin invitation' });
  }
};

module.exports = {
  inviteAdminController,
};
