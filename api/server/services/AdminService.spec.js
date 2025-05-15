const { processGrantAdminAccess, sendAdminRoleGrantedEmail } = require('./AdminService');
const { findUser } = require('~/models/userMethods');
const { updateUser } = require('~/models');
const { createAdminInvitation, findPendingAdminInvitationByEmail } = require('~/models/AdminInvitation');
const { sendEmail, checkEmailConfig } = require('~/server/utils');
const { logger } = require('~/config');
const { SystemRoles } = require('librechat-data-provider');

// Mock dependencies
jest.mock('~/models/userMethods', () => ({
  findUser: jest.fn(),
}));

jest.mock('~/models', () => ({
  updateUser: jest.fn(),
}));

jest.mock('~/models/AdminInvitation', () => ({
  createAdminInvitation: jest.fn(),
  findPendingAdminInvitationByEmail: jest.fn(),
}));

jest.mock('~/server/utils', () => ({
  sendEmail: jest.fn(),
  checkEmailConfig: jest.fn(),
}));

jest.mock('~/config', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe('AdminService', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('processGrantAdminAccess', () => {
    it('should return error for invalid email format', async () => {
      const result = await processGrantAdminAccess('invalid-email');

      expect(result).toEqual({
        success: false,
        status: 400,
        message: 'Invalid email address',
      });

      // Verify no other functions were called
      expect(findUser).not.toHaveBeenCalled();
      expect(findPendingAdminInvitationByEmail).not.toHaveBeenCalled();
      expect(createAdminInvitation).not.toHaveBeenCalled();
      expect(checkEmailConfig).not.toHaveBeenCalled();
      expect(sendEmail).not.toHaveBeenCalled();
    });

    it('should grant admin role if user exists but is not an admin and send notification email', async () => {
      const email = 'test@example.com';
      const userId = 'user-id';
      const updatedUser = { _id: userId, email, role: SystemRoles.ADMIN };

      findUser.mockResolvedValue({ _id: userId, email, role: SystemRoles.USER });
      updateUser.mockResolvedValue(updatedUser);
      checkEmailConfig.mockReturnValue(true);
      sendEmail.mockResolvedValue({});

      process.env.DOMAIN_CLIENT = 'http://localhost:3000';

      const result = await processGrantAdminAccess(email);

      expect(result).toEqual({
        success: true,
        status: 200,
        message: 'Admin role granted successfully',
        user: updatedUser,
      });

      expect(findUser).toHaveBeenCalledWith({ email }, 'email _id role');
      expect(updateUser).toHaveBeenCalledWith(userId, { role: SystemRoles.ADMIN });
      expect(findPendingAdminInvitationByEmail).not.toHaveBeenCalled();
      expect(createAdminInvitation).not.toHaveBeenCalled();
      expect(checkEmailConfig).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalledWith({
        email,
        subject: 'You have been granted Administrator access',
        payload: {
          appName: expect.any(String),
          name: email,
          loginLink: 'http://localhost:3000/login',
        },
        template: 'adminNotification.handlebars',
      });
      expect(logger.info).toHaveBeenCalledWith(`User ${email} has been granted admin role`);
    });

    it('should grant admin role if user exists but is not an admin and not send email if email config is not available', async () => {
      const email = 'test@example.com';
      const userId = 'user-id';
      const updatedUser = { _id: userId, email, role: SystemRoles.ADMIN };

      findUser.mockResolvedValue({ _id: userId, email, role: SystemRoles.USER });
      updateUser.mockResolvedValue(updatedUser);
      checkEmailConfig.mockReturnValue(false);

      process.env.DOMAIN_CLIENT = 'http://localhost:3000';

      const result = await processGrantAdminAccess(email);

      expect(result).toEqual({
        success: true,
        status: 200,
        message: 'Admin role granted successfully',
        user: updatedUser,
      });

      expect(findUser).toHaveBeenCalledWith({ email }, 'email _id role');
      expect(updateUser).toHaveBeenCalledWith(userId, { role: SystemRoles.ADMIN });
      expect(findPendingAdminInvitationByEmail).not.toHaveBeenCalled();
      expect(createAdminInvitation).not.toHaveBeenCalled();
      expect(checkEmailConfig).toHaveBeenCalled();
      expect(sendEmail).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(`User ${email} has been granted admin role`);
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Email configuration not available'));
    });

    it('should return error if user already has admin role', async () => {
      const email = 'test@example.com';

      findUser.mockResolvedValue({ _id: 'user-id', email, role: SystemRoles.ADMIN });

      const result = await processGrantAdminAccess(email);

      expect(result).toEqual({
        success: false,
        status: 400,
        message: 'User already has admin role',
      });

      expect(findUser).toHaveBeenCalledWith({ email }, 'email _id role');
      expect(updateUser).not.toHaveBeenCalled();
      expect(findPendingAdminInvitationByEmail).not.toHaveBeenCalled();
      expect(createAdminInvitation).not.toHaveBeenCalled();
      expect(checkEmailConfig).not.toHaveBeenCalled();
      expect(sendEmail).not.toHaveBeenCalled();
    });

    it('should return error if updating user role fails', async () => {
      const email = 'test@example.com';
      const userId = 'user-id';

      findUser.mockResolvedValue({ _id: userId, email, role: SystemRoles.USER });
      updateUser.mockResolvedValue(null);

      const result = await processGrantAdminAccess(email);

      expect(result).toEqual({
        success: false,
        status: 500,
        message: 'Failed to update user role',
      });

      expect(findUser).toHaveBeenCalledWith({ email }, 'email _id role');
      expect(updateUser).toHaveBeenCalledWith(userId, { role: SystemRoles.ADMIN });
      expect(findPendingAdminInvitationByEmail).not.toHaveBeenCalled();
      expect(createAdminInvitation).not.toHaveBeenCalled();
      expect(checkEmailConfig).not.toHaveBeenCalled();
      expect(sendEmail).not.toHaveBeenCalled();
    });

    it('should return error if invitation already exists', async () => {
      const email = 'test@example.com';
      findUser.mockResolvedValue(null);
      findPendingAdminInvitationByEmail.mockResolvedValue({ email });

      const result = await processGrantAdminAccess(email);

      expect(result).toEqual({
        success: false,
        status: 400,
        message: 'An invitation has already been sent to this email',
      });

      expect(findUser).toHaveBeenCalledWith({ email }, 'email _id role');
      expect(findPendingAdminInvitationByEmail).toHaveBeenCalledWith(email);
      expect(createAdminInvitation).not.toHaveBeenCalled();
      expect(checkEmailConfig).not.toHaveBeenCalled();
      expect(sendEmail).not.toHaveBeenCalled();
    });

    it('should create invitation and send email successfully', async () => {
      const email = 'test@example.com';
      const token = 'test-token';
      const invitation = { _id: 'invitation-id', email };

      findUser.mockResolvedValue(null);
      findPendingAdminInvitationByEmail.mockResolvedValue(null);
      createAdminInvitation.mockResolvedValue({ invitation, token });
      checkEmailConfig.mockReturnValue(true);
      sendEmail.mockResolvedValue({});

      process.env.DOMAIN_CLIENT = 'http://localhost:3000';

      const result = await processGrantAdminAccess(email);

      expect(result).toEqual({
        success: true,
        status: 201,
        message: 'Invitation sent successfully',
        invitation,
      });

      expect(findUser).toHaveBeenCalledWith({ email }, 'email _id role');
      expect(findPendingAdminInvitationByEmail).toHaveBeenCalledWith(email);
      expect(createAdminInvitation).toHaveBeenCalledWith({ email });
      expect(checkEmailConfig).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalledWith({
        email,
        subject: 'Invitation to join as an Administrator',
        payload: {
          appName: expect.any(String),
          name: email,
          inviteLink: `http://localhost:3000/admin-invite?token=${token}&email=${encodeURIComponent(email)}`,
        },
        template: 'adminInvite.handlebars',
      });
    });

    it('should create invitation but not send email if email config is not available', async () => {
      const email = 'test@example.com';
      const token = 'test-token';
      const invitation = { _id: 'invitation-id', email };

      findUser.mockResolvedValue(null);
      findPendingAdminInvitationByEmail.mockResolvedValue(null);
      createAdminInvitation.mockResolvedValue({ invitation, token });
      checkEmailConfig.mockReturnValue(false);

      process.env.DOMAIN_CLIENT = 'http://localhost:3000';

      const result = await processGrantAdminAccess(email);

      expect(result).toEqual({
        success: true,
        status: 201,
        message: 'Invitation sent successfully',
        invitation,
      });

      expect(findUser).toHaveBeenCalledWith({ email }, 'email _id role');
      expect(findPendingAdminInvitationByEmail).toHaveBeenCalledWith(email);
      expect(createAdminInvitation).toHaveBeenCalledWith({ email });
      expect(checkEmailConfig).toHaveBeenCalled();
      expect(sendEmail).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalled();
    });

    it('should handle errors during invitation process', async () => {
      const email = 'test@example.com';
      const error = new Error('Test error');

      findUser.mockRejectedValue(error);

      const result = await processGrantAdminAccess(email);

      expect(result).toEqual({
        success: false,
        status: 500,
        message: 'Error processing invitation',
      });

      expect(logger.error).toHaveBeenCalledWith(
        '[processGrantAdminAccess] Error processing admin invitation',
        error,
      );
    });
  });
});
