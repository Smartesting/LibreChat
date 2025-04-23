// Set environment variables for testing
process.env.CREDS_KEY = '0123456789abcdef0123456789abcdef';
process.env.CREDS_IV = '0123456789abcdef';
process.env.CREDS_KEY_V2 = '0123456789abcdef0123456789abcdef';
process.env.CREDS_IV_V2 = '0123456789abcdef';

const bcrypt = require('bcryptjs');
const { acceptAdminInvitation } = require('../server/controllers/TrainingOrganizationController');
const { getListTrainingOrganizations, updateTrainingOrganizationAdmin } = require('../models/TrainingOrganization');
const { registerUser } = require('../server/services/AuthService');
const { findUser } = require('../models/userMethods');
const { logger } = require('../config');

// Mock dependencies
jest.mock('../models/TrainingOrganization');
jest.mock('../server/services/AuthService');
jest.mock('../models/userMethods');
jest.mock('../config', () => ({
  logger: {
    error: jest.fn(),
  },
}));
jest.mock('bcryptjs');

describe('TrainingOrganizationController - acceptAdminInvitationHandler', () => {
  let req, res;

  beforeEach(() => {
    // Mock request and response objects
    req = {
      body: {
        token: 'test-token',
        email: 'test@example.com',
        password: 'Password123!',
        confirm_password: 'Password123!',
        name: 'Test User',
        username: 'testuser',
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Reset all mocks
    jest.clearAllMocks();

    // Mock bcrypt.compareSync
    bcrypt.compareSync = jest.fn();

    // Mock database functions
    getListTrainingOrganizations.mockReset();
    updateTrainingOrganizationAdmin.mockReset();
    registerUser.mockReset();
    findUser.mockReset();
  });

  afterEach(() => {
    // No need to restore mocks as jest.clearAllMocks() is called in beforeEach
  });

  it('should return 400 if required fields are missing', async () => {
    // Test with missing token
    req.body.token = undefined;
    await acceptAdminInvitation(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing required fields' });

    // Reset and test with missing email
    req.body.token = 'test-token';
    req.body.email = undefined;
    await acceptAdminInvitation(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

    // Reset and test with missing password
    req.body.email = 'test@example.com';
    req.body.password = undefined;
    await acceptAdminInvitation(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

    // Reset and test with missing confirm_password
    req.body.password = 'Password123!';
    req.body.confirm_password = undefined;
    await acceptAdminInvitation(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

    // Reset and test with missing name
    req.body.confirm_password = 'Password123!';
    req.body.name = undefined;
    await acceptAdminInvitation(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 404 if no matching organization and admin is found', async () => {
    // Mock empty organizations list
    getListTrainingOrganizations.mockResolvedValue([]);

    await acceptAdminInvitation(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired invitation token' });
  });

  it('should return 404 if token verification fails', async () => {
    // Mock organizations with an admin that has matching email but token verification fails
    const mockOrgs = [{
      _id: 'org-id-1',
      name: 'Test Org',
      administrators: [{
        email: 'test@example.com',
        status: 'invited',
        invitationToken: 'hashed-token',
      }],
    }];

    getListTrainingOrganizations.mockResolvedValue(mockOrgs);
    bcrypt.compareSync.mockReturnValue(false); // Token verification fails

    await acceptAdminInvitation(req, res);

    expect(bcrypt.compareSync).toHaveBeenCalledWith('test-token', 'hashed-token');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired invitation token' });
  });

  it('should return 400 if invitation has expired', async () => {
    // Mock organizations with an admin that has matching email and token but invitation expired
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1); // 1 day in the past

    const mockOrgs = [{
      _id: 'org-id-1',
      name: 'Test Org',
      administrators: [{
        email: 'test@example.com',
        status: 'invited',
        invitationToken: 'hashed-token',
        invitationExpires: pastDate,
      }],
    }];

    getListTrainingOrganizations.mockResolvedValue(mockOrgs);
    bcrypt.compareSync.mockReturnValue(true); // Token verification succeeds

    await acceptAdminInvitation(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invitation has expired' });
  });

  it('should return error status if user registration fails', async () => {
    // Mock organizations with a valid admin invitation
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 days in the future

    const mockOrgs = [{
      _id: 'org-id-1',
      name: 'Test Org',
      administrators: [{
        email: 'test@example.com',
        status: 'invited',
        invitationToken: 'hashed-token',
        invitationExpires: futureDate,
      }],
    }];

    getListTrainingOrganizations.mockResolvedValue(mockOrgs);
    bcrypt.compareSync.mockReturnValue(true); // Token verification succeeds

    // Mock registration failure
    registerUser.mockResolvedValue({
      status: 400,
      message: 'Registration failed',
    });

    await acceptAdminInvitation(req, res);

    expect(registerUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'Password123!',
      confirm_password: 'Password123!',
      name: 'Test User',
      username: 'testuser',
    }, { emailVerified: true });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Registration failed' });
  });

  it('should return 500 if user is not found after registration', async () => {
    // Mock organizations with a valid admin invitation
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 days in the future

    const mockOrgs = [{
      _id: 'org-id-1',
      name: 'Test Org',
      administrators: [{
        email: 'test@example.com',
        status: 'invited',
        invitationToken: 'hashed-token',
        invitationExpires: futureDate,
      }],
    }];

    getListTrainingOrganizations.mockResolvedValue(mockOrgs);
    bcrypt.compareSync.mockReturnValue(true); // Token verification succeeds

    // Mock successful registration
    registerUser.mockResolvedValue({
      status: 200,
    });

    // Mock user not found
    findUser.mockResolvedValue(null);

    await acceptAdminInvitation(req, res);

    expect(findUser).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to create user account' });
  });

  it('should return 500 if organization update fails', async () => {
    // Mock organizations with a valid admin invitation
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 days in the future

    const mockOrgs = [{
      _id: 'org-id-1',
      name: 'Test Org',
      administrators: [{
        email: 'test@example.com',
        status: 'invited',
        invitationToken: 'hashed-token',
        invitationExpires: futureDate,
      }],
    }];

    getListTrainingOrganizations.mockResolvedValue(mockOrgs);
    bcrypt.compareSync.mockReturnValue(true); // Token verification succeeds

    // Mock successful registration
    registerUser.mockResolvedValue({
      status: 200,
    });

    // Mock user found
    findUser.mockResolvedValue({
      _id: 'user-id-1',
      email: 'test@example.com',
    });

    // Mock organization update failure
    updateTrainingOrganizationAdmin.mockResolvedValue(null);

    await acceptAdminInvitation(req, res);

    expect(updateTrainingOrganizationAdmin).toHaveBeenCalledWith('org-id-1', 'test@example.com', {
      userId: 'user-id-1',
      status: 'active',
      activatedAt: expect.any(Date),
    });

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to update administrator status' });
  });

  it('should return 200 if invitation is successfully accepted', async () => {
    // Mock organizations with a valid admin invitation
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 days in the future

    const mockOrgs = [{
      _id: 'org-id-1',
      name: 'Test Org',
      administrators: [{
        email: 'test@example.com',
        status: 'invited',
        invitationToken: 'hashed-token',
        invitationExpires: futureDate,
      }],
    }];

    getListTrainingOrganizations.mockResolvedValue(mockOrgs);
    bcrypt.compareSync.mockReturnValue(true); // Token verification succeeds

    // Mock successful registration
    registerUser.mockResolvedValue({
      status: 200,
    });

    // Mock user found
    findUser.mockResolvedValue({
      _id: 'user-id-1',
      email: 'test@example.com',
    });

    // Mock successful organization update
    updateTrainingOrganizationAdmin.mockResolvedValue({
      _id: 'org-id-1',
      name: 'Test Org',
      administrators: [{
        email: 'test@example.com',
        userId: 'user-id-1',
        status: 'active',
        activatedAt: new Date(),
      }],
    });

    await acceptAdminInvitation(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Invitation accepted successfully',
    });
  });

  it('should handle errors and return 500', async () => {
    // Force an error by making getListTrainingOrganizations throw
    getListTrainingOrganizations.mockRejectedValue(new Error('Database error'));

    await acceptAdminInvitation(req, res);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
  });
});
