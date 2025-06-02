const { FileSources } = require('librechat-data-provider');
const {
  Balance,
  getFiles,
  updateUser,
  deleteFiles,
  deleteConvos,
  deletePresets,
  deleteMessages,
  deleteUserById,
  deleteAllUserSessions,
  generateTraineeUsers,
} = require('~/models');
const User = require('~/models/User');
const { updateUserPluginAuth, deleteUserPluginAuth } = require('~/server/services/PluginService');
const { updateUserPluginsService, deleteUserKey } = require('~/server/services/UserService');
const { verifyEmail, resendVerificationEmail } = require('~/server/services/AuthService');
const { needsRefresh, getNewS3URL } = require('~/server/services/Files/S3/crud');
const { processDeleteRequest } = require('~/server/services/Files/process');
const { deleteAllSharedLinks } = require('~/models/Share');
const { deleteToolCalls } = require('~/models/ToolCall');
const { Transaction } = require('~/models/Transaction');
const { logger } = require('~/config');
const { removeExpiredTraineeAccounts } = require('~/models/userMethods');
const { deleteUserFromOrganizations } = require('~/server/services/TrainingOrganizationService');

const getUserController = async (req, res) => {
  /** @type {MongoUser} */
  const userData = req.user.toObject != null ? req.user.toObject() : { ...req.user };
  delete userData.totpSecret;
  if (req.app.locals.fileStrategy === FileSources.s3 && userData.avatar) {
    const avatarNeedsRefresh = needsRefresh(userData.avatar, 3600);
    if (!avatarNeedsRefresh) {
      return res.status(200).send(userData);
    }
    const originalAvatar = userData.avatar;
    try {
      userData.avatar = await getNewS3URL(userData.avatar);
      await updateUser(userData.id, { avatar: userData.avatar });
    } catch (error) {
      userData.avatar = originalAvatar;
      logger.error('Error getting new S3 URL for avatar:', error);
    }
  }
  res.status(200).send(userData);
};

const getTermsStatusController = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ termsAccepted: !!user.termsAccepted });
  } catch (error) {
    logger.error('Error fetching terms acceptance status:', error);
    res.status(500).json({ message: 'Error fetching terms acceptance status' });
  }
};

const acceptTermsController = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, { termsAccepted: true }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'Terms accepted successfully' });
  } catch (error) {
    logger.error('Error accepting terms:', error);
    res.status(500).json({ message: 'Error accepting terms' });
  }
};

const deleteUserFiles = async (req) => {
  try {
    const userFiles = await getFiles({ user: req.user.id });
    await processDeleteRequest({
      req,
      files: userFiles,
    });
  } catch (error) {
    logger.error('[deleteUserFiles]', error);
  }
};

const deleteUserFilesByUserId = async (req, userId) => {
  try {
    const userFiles = await getFiles({ user: userId });
    await processDeleteRequest({
      req,
      files: userFiles,
    });
  } catch (error) {
    logger.error('[deleteUserFiles]', error);
  }
};

const updateUserPluginsController = async (req, res) => {
  const { user } = req;
  const { pluginKey, action, auth, isEntityTool } = req.body;
  let authService;
  try {
    if (!isEntityTool) {
      const userPluginsService = await updateUserPluginsService(user, pluginKey, action);

      if (userPluginsService instanceof Error) {
        logger.error('[userPluginsService]', userPluginsService);
        const { status, message } = userPluginsService;
        res.status(status).send({ message });
      }
    }

    if (auth) {
      const keys = Object.keys(auth);
      const values = Object.values(auth);
      if (action === 'install' && keys.length > 0) {
        for (let i = 0; i < keys.length; i++) {
          authService = await updateUserPluginAuth(user.id, keys[i], pluginKey, values[i]);
          if (authService instanceof Error) {
            logger.error('[authService]', authService);
            const { status, message } = authService;
            res.status(status).send({ message });
          }
        }
      }
      if (action === 'uninstall' && keys.length > 0) {
        for (let i = 0; i < keys.length; i++) {
          authService = await deleteUserPluginAuth(user.id, keys[i]);
          if (authService instanceof Error) {
            logger.error('[authService]', authService);
            const { status, message } = authService;
            res.status(status).send({ message });
          }
        }
      }
    }

    res.status(200).send();
  } catch (err) {
    logger.error('[updateUserPluginsController]', err);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const deleteUserController = async (req, res) => {
  const { user } = req;

  if (await deleteUserMethods(req, user.id)) {
    return res.status(200).send({ message: 'User deleted' });
  }
  return res.status(500).json({ message: 'Something went wrong.' });
};

const deleteUserByIdController = async (req, res) => {
  const { userId } = req.params;
  if (await deleteUserMethods(req, userId)) {
    return res.status(200).send({ message: 'User deleted' });
  }
  return res.status(500).json({ message: 'Something went wrong.' });
};

const deleteUserMethods = async (req, userId) => {
  try {
    await deleteMessages({ user: userId }); // delete user messages
    await deleteAllUserSessions({ userId: userId }); // delete user sessions
    await Transaction.deleteMany({ user: userId }); // delete user transactions
    await deleteUserKey({ userId: userId, all: true }); // delete user keys
    await Balance.deleteMany({ user: userId }); // delete user balances
    await deletePresets(userId); // delete user presets
    await deleteConvos(userId); // delete user convos
    await deleteUserPluginAuth(userId, null, true); // delete user plugin auth
    await deleteUserById(userId); // delete user
    await deleteAllSharedLinks(userId); // delete user shared links
    await deleteUserFilesByUserId(req, userId); // delete user files
    await deleteFiles(null, userId); // delete database files in case of orphaned files from previous steps
    await deleteToolCalls(userId); // delete user tool calls
    await deleteUserFromOrganizations(userId); // delete user from organizations
    logger.info(`User deleted account. ID: ${userId}`);
    return true;
  } catch (err) {
    logger.error('[deleteUserController]', err);
    return false;
  }
};

const verifyEmailController = async (req, res) => {
  try {
    const verifyEmailService = await verifyEmail(req);
    if (verifyEmailService instanceof Error) {
      return res.status(400).json(verifyEmailService);
    } else {
      return res.status(200).json(verifyEmailService);
    }
  } catch (e) {
    logger.error('[verifyEmailController]', e);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const resendVerificationController = async (req, res) => {
  try {
    const result = await resendVerificationEmail(req);
    if (result instanceof Error) {
      return res.status(400).json(result);
    } else {
      return res.status(200).json(result);
    }
  } catch (e) {
    logger.error('[verifyEmailController]', e);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

/**
 * Generate multiple trainee users with random credentials
 * @param {Object} req - Express request object with count in the body
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with created users
 */
const generateTraineesController = async (req, res) => {
  try {
    const { count } = req.body;

    if (!count || !Number.isInteger(Number(count)) || Number(count) <= 0) {
      return res.status(400).json({ error: 'A valid positive integer count is required' });
    }

    const users = await generateTraineeUsers(Number(count));

    return res.status(201).json({
      message: `Successfully created ${users.length} trainee users`,
      users,
    });
  } catch (error) {
    logger.error('[generateTraineesController]', error);
    return res.status(500).json({ error: error.message });
  }
};

const removeExpiredTraineeAccountsController = async (req, res) => {
  try {
    await removeExpiredTraineeAccounts();
    return res.status(200).send();
  } catch (error) {
    logger.error('[removeExpiredTraineeAccounts]', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get all users with their roles
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllUsersController = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0, totpSecret: 0 });
    res.status(200).json(users);
  } catch (error) {
    logger.error('Error fetching all users:', error);
    res.status(500).json({ message: 'Error fetching all users' });
  }
};

module.exports = {
  getUserController,
  getTermsStatusController,
  acceptTermsController,
  deleteUserController,
  deleteUserByIdController,
  verifyEmailController,
  updateUserPluginsController,
  resendVerificationController,
  generateTraineesController,
  removeExpiredTraineeAccountsController,
  getAllUsersController,
};
