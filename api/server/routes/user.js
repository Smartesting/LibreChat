const express = require('express');
const {
  requireJwtAuth,
  canDeleteAccount,
  verifyEmailLimiter,
  checkAdmin,
} = require('~/server/middleware');
const {
  getUserController,
  deleteUserController,
  verifyEmailController,
  updateUserPluginsController,
  resendVerificationController,
  getTermsStatusController,
  acceptTermsController,
  generateTraineesController,
  removeExpiredTraineeAccountsController,
  getAllUsersController,
  deleteUserByIdController,
} = require('~/server/controllers/UserController');

const router = express.Router();

router.get('/', requireJwtAuth, getUserController);
router.get('/terms', requireJwtAuth, getTermsStatusController);
router.post('/terms/accept', requireJwtAuth, acceptTermsController);
router.post('/plugins', requireJwtAuth, updateUserPluginsController);
router.delete('/delete', requireJwtAuth, canDeleteAccount, deleteUserController);
router.delete('/:userId/delete', requireJwtAuth, checkAdmin, deleteUserByIdController);
router.post('/verify', verifyEmailController);
router.post('/verify/resend', verifyEmailLimiter, resendVerificationController);
router.post('/generate-trainees', requireJwtAuth, checkAdmin, generateTraineesController);
router.get(
  '/remove-expired-trainees',
  requireJwtAuth,
  checkAdmin,
  removeExpiredTraineeAccountsController,
);
router.get('/all', requireJwtAuth, checkAdmin, getAllUsersController);

module.exports = router;
