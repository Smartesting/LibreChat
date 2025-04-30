const { processAdminInvitation } = require('./AdminInvitationService');
const { findUser } = require('~/models/userMethods');
const { createAdminInvitation, findPendingAdminInvitationByEmail } = require('~/models/AdminInvitation');
const { sendEmail, checkEmailConfig } = require('~/server/utils');
const { logger } = require('~/config');

// Mock dependencies
jest.mock('~/models/userMethods', () => ({
  findUser: jest.fn(),
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

describe('AdminInvitationService', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('processAdminInvitation', () => {
    it('should return error for invalid email format', async () => {
      const result = await processAdminInvitation('invalid-email');

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

    it('should return error if user already exists', async () => {
      const email = 'test@example.com';
      findUser.mockResolvedValue({ _id: 'user-id', email });

      const result = await processAdminInvitation(email);

      expect(result).toEqual({
        success: false,
        status: 400,
        message: 'A user with this email already exists',
      });

      expect(findUser).toHaveBeenCalledWith({ email }, 'email _id role');
      expect(findPendingAdminInvitationByEmail).not.toHaveBeenCalled();
      expect(createAdminInvitation).not.toHaveBeenCalled();
      expect(checkEmailConfig).not.toHaveBeenCalled();
      expect(sendEmail).not.toHaveBeenCalled();
    });

    it('should return error if invitation already exists', async () => {
      const email = 'test@example.com';
      findUser.mockResolvedValue(null);
      findPendingAdminInvitationByEmail.mockResolvedValue({ email });

      const result = await processAdminInvitation(email);

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

      const result = await processAdminInvitation(email);

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

      const result = await processAdminInvitation(email);

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

      const result = await processAdminInvitation(email);

      expect(result).toEqual({
        success: false,
        status: 500,
        message: 'Error processing invitation',
      });

      expect(logger.error).toHaveBeenCalledWith(
        '[processAdminInvitation] Error processing admin invitation',
        error,
      );
    });
  });
});
