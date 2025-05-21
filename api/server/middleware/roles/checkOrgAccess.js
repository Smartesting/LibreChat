const { SystemRoles } = require('librechat-data-provider');
const { getTrainingOrganizationById } = require('~/models/TrainingOrganization');

/**
 * Middleware to check if the user is a super admin or an administrator of the organization
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {void}
 */
async function checkOrgAccess(req, res, next) {
  try {
    // If user is a super admin, allow access
    if (req.user.role === SystemRoles.ADMIN) {
      return next();
    }

    // Get the organization ID from the request parameters
    const { organizationId } = req.params;
    if (!organizationId) {
      return res.status(400).json({ message: 'Missing organization ID' });
    }

    // Get the organization
    const organization = await getTrainingOrganizationById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Check if the user is an administrator of the organization
    const isOrgAdmin = organization.administrators.some(
      (admin) =>
        admin.userId && admin.userId.toString() === req.user.id && admin.status === 'active',
    );

    if (!isOrgAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  } catch (error) {
    console.error('Error in checkOrgAccess middleware:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports = checkOrgAccess;
