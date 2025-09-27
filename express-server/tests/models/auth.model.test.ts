import { RefreshToken, PasswordResetToken, UserSession } from '../../src/models/auth.model';
import { User } from '../../src/models/user.model';
import bcrypt from 'bcrypt';

describe('Auth Models', () => {
  let testUser: any;

  beforeEach(async () => {
    // Create test user
    testUser = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      userName: 'johndoe',
      email: 'john@example.com',
      password: await bcrypt.hash('Password123!', 12),
      gender: 'male',
      dob: new Date('1990-01-01')
    });
  });

  describe('RefreshToken Model', () => {
    it('should create a refresh token', async () => {
      const refreshTokenData = {
        userId: testUser._id,
        token: 'test-refresh-token-123',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      };

      const refreshToken = new RefreshToken(refreshTokenData);
      const savedToken = await refreshToken.save();

      expect(savedToken._id).toBeDefined();
      expect(savedToken.userId.toString()).toBe(testUser._id.toString());
      expect(savedToken.token).toBe(refreshTokenData.token);
      expect(savedToken.expiresAt).toEqual(refreshTokenData.expiresAt);
      expect(savedToken.createdAt).toBeDefined();
      expect(savedToken.updatedAt).toBeDefined();
    });

    it('should not create refresh token without required fields', async () => {
      const refreshTokenData = {
        token: 'test-refresh-token-123'
        // Missing userId, expiresAt
      };

      const refreshToken = new RefreshToken(refreshTokenData);
      
      await expect(refreshToken.save()).rejects.toThrow();
    });

    it('should find refresh token by token', async () => {
      const refreshTokenData = {
        userId: testUser._id,
        token: 'test-refresh-token-123',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      await RefreshToken.create(refreshTokenData);

      const foundToken = await RefreshToken.findOne({ token: 'test-refresh-token-123' });
      
      expect(foundToken).toBeDefined();
      expect(foundToken?.token).toBe('test-refresh-token-123');
      expect(foundToken?.userId.toString()).toBe(testUser._id.toString());
    });

    it('should find refresh tokens by user ID', async () => {
      const refreshTokenData = {
        userId: testUser._id,
        token: 'test-refresh-token-123',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      await RefreshToken.create(refreshTokenData);

      const userTokens = await RefreshToken.find({ userId: testUser._id });
      
      expect(userTokens).toHaveLength(1);
      expect(userTokens[0].token).toBe('test-refresh-token-123');
    });

    it('should delete expired refresh tokens', async () => {
      const expiredToken = {
        userId: testUser._id,
        token: 'expired-token',
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      };

      const validToken = {
        userId: testUser._id,
        token: 'valid-token',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      };

      await RefreshToken.create(expiredToken);
      await RefreshToken.create(validToken);

      // Delete expired tokens
      const result = await RefreshToken.deleteMany({
        expiresAt: { $lt: new Date() }
      });

      expect(result.deletedCount).toBe(1);

      const remainingTokens = await RefreshToken.find({ userId: testUser._id });
      expect(remainingTokens).toHaveLength(1);
      expect(remainingTokens[0].token).toBe('valid-token');
    });
  });

  describe('PasswordResetToken Model', () => {
    it('should create a password reset token', async () => {
      const resetTokenData = {
        userId: testUser._id,
        token: 'test-reset-token-123',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        used: false
      };

      const resetToken = new PasswordResetToken(resetTokenData);
      const savedToken = await resetToken.save();

      expect(savedToken._id).toBeDefined();
      expect(savedToken.userId.toString()).toBe(testUser._id.toString());
      expect(savedToken.token).toBe(resetTokenData.token);
      expect(savedToken.expiresAt).toEqual(resetTokenData.expiresAt);
      expect(savedToken.used).toBe(false);
      expect(savedToken.createdAt).toBeDefined();
      expect(savedToken.updatedAt).toBeDefined();
    });

    it('should not create password reset token without required fields', async () => {
      const resetTokenData = {
        token: 'test-reset-token-123'
        // Missing userId, expiresAt
      };

      const resetToken = new PasswordResetToken(resetTokenData);
      
      await expect(resetToken.save()).rejects.toThrow();
    });

    it('should find password reset token by token', async () => {
      const resetTokenData = {
        userId: testUser._id,
        token: 'test-reset-token-123',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        used: false
      };

      await PasswordResetToken.create(resetTokenData);

      const foundToken = await PasswordResetToken.findOne({ token: 'test-reset-token-123' });
      
      expect(foundToken).toBeDefined();
      expect(foundToken?.token).toBe('test-reset-token-123');
      expect(foundToken?.userId.toString()).toBe(testUser._id.toString());
      expect(foundToken?.used).toBe(false);
    });

    it('should find valid password reset tokens', async () => {
      const validToken = {
        userId: testUser._id,
        token: 'valid-reset-token',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        used: false
      };

      const expiredToken = {
        userId: testUser._id,
        token: 'expired-reset-token',
        expiresAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        used: false
      };

      const usedToken = {
        userId: testUser._id,
        token: 'used-reset-token',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        used: true
      };

      await PasswordResetToken.create(validToken);
      await PasswordResetToken.create(expiredToken);
      await PasswordResetToken.create(usedToken);

      const validTokens = await PasswordResetToken.find({
        expiresAt: { $gt: new Date() },
        used: false
      });
      
      expect(validTokens).toHaveLength(1);
      expect(validTokens[0].token).toBe('valid-reset-token');
    });

    it('should mark password reset token as used', async () => {
      const resetTokenData = {
        userId: testUser._id,
        token: 'test-reset-token-123',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        used: false
      };

      const resetToken = await PasswordResetToken.create(resetTokenData);

      const updatedToken = await PasswordResetToken.findByIdAndUpdate(
        resetToken._id,
        { used: true },
        { new: true }
      );

      expect(updatedToken?.used).toBe(true);
    });

    it('should delete expired password reset tokens', async () => {
      const expiredToken = {
        userId: testUser._id,
        token: 'expired-reset-token',
        expiresAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        used: false
      };

      const validToken = {
        userId: testUser._id,
        token: 'valid-reset-token',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        used: false
      };

      await PasswordResetToken.create(expiredToken);
      await PasswordResetToken.create(validToken);

      // Delete expired tokens
      const result = await PasswordResetToken.deleteMany({
        expiresAt: { $lt: new Date() }
      });

      expect(result.deletedCount).toBe(1);

      const remainingTokens = await PasswordResetToken.find({ userId: testUser._id });
      expect(remainingTokens).toHaveLength(1);
      expect(remainingTokens[0].token).toBe('valid-reset-token');
    });
  });

  describe('UserSession Model', () => {
    it('should create a user session', async () => {
      const sessionData = {
        userId: testUser._id,
        refreshToken: 'test-refresh-token-123',
        deviceInfo: {
          userAgent: 'Mozilla/5.0 Test Browser',
          ipAddress: '192.168.1.1',
          deviceType: 'desktop'
        },
        isActive: true,
        lastActivity: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      const session = new UserSession(sessionData);
      const savedSession = await session.save();

      expect(savedSession._id).toBeDefined();
      expect(savedSession.userId.toString()).toBe(testUser._id.toString());
      expect(savedSession.refreshToken).toBe(sessionData.refreshToken);
      expect(savedSession.deviceInfo).toEqual(sessionData.deviceInfo);
      expect(savedSession.isActive).toBe(true);
      expect(savedSession.lastActivity).toEqual(sessionData.lastActivity);
      expect(savedSession.createdAt).toBeDefined();
      expect(savedSession.updatedAt).toBeDefined();
    });

    it('should not create user session without required fields', async () => {
      const sessionData = {
        refreshToken: 'test-session-123'
        // Missing userId
      };

      const session = new UserSession(sessionData);
      
      await expect(session.save()).rejects.toThrow();
    });

    it('should find user session by refresh token', async () => {
      const sessionData = {
        userId: testUser._id,
        refreshToken: 'test-refresh-token-123',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        deviceInfo: {
          userAgent: 'Mozilla/5.0 Test Browser',
          ipAddress: '192.168.1.1',
          deviceType: 'desktop'
        },
        isActive: true,
        lastActivity: new Date()
      };

      await UserSession.create(sessionData);

      const foundSession = await UserSession.findOne({ refreshToken: 'test-refresh-token-123' });
      
      expect(foundSession).toBeDefined();
      expect(foundSession?.refreshToken).toBe('test-refresh-token-123');
      expect(foundSession?.userId.toString()).toBe(testUser._id.toString());
    });

    it('should find active user sessions', async () => {
      const activeSession = {
        userId: testUser._id,
        refreshToken: 'active-refresh-token',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        deviceInfo: { userAgent: 'Test Browser' },
        isActive: true,
        lastActivity: new Date()
      };

      const inactiveSession = {
        userId: testUser._id,
        refreshToken: 'inactive-refresh-token',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        deviceInfo: { userAgent: 'Test Browser' },
        isActive: false,
        lastActivity: new Date()
      };

      await UserSession.create(activeSession);
      await UserSession.create(inactiveSession);

      const activeSessions = await UserSession.find({ isActive: true });
      
      expect(activeSessions).toHaveLength(1);
      expect(activeSessions[0].refreshToken).toBe('active-refresh-token');
    });

    it('should update session last activity', async () => {
      const sessionData = {
        userId: testUser._id,
        refreshToken: 'test-refresh-token-123',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        deviceInfo: { userAgent: 'Test Browser' },
        isActive: true,
        lastActivity: new Date()
      };

      const session = await UserSession.create(sessionData);
      const newActivity = new Date();

      const updatedSession = await UserSession.findByIdAndUpdate(
        session._id,
        { lastActivity: newActivity },
        { new: true }
      );

      expect(updatedSession?.lastActivity).toEqual(newActivity);
    });

    it('should deactivate user session', async () => {
      const sessionData = {
        userId: testUser._id,
        refreshToken: 'test-refresh-token-123',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        deviceInfo: { userAgent: 'Test Browser' },
        isActive: true,
        lastActivity: new Date()
      };

      const session = await UserSession.create(sessionData);

      const updatedSession = await UserSession.findByIdAndUpdate(
        session._id,
        { isActive: false },
        { new: true }
      );

      expect(updatedSession?.isActive).toBe(false);
    });

    it('should find sessions by user ID', async () => {
      const session1 = {
        userId: testUser._id,
        refreshToken: 'refresh-token-1',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        deviceInfo: { userAgent: 'Test Browser' },
        isActive: true,
        lastActivity: new Date()
      };

      const session2 = {
        userId: testUser._id,
        refreshToken: 'refresh-token-2',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        deviceInfo: { userAgent: 'Test Browser' },
        isActive: true,
        lastActivity: new Date()
      };

      await UserSession.create(session1);
      await UserSession.create(session2);

      const userSessions = await UserSession.find({ userId: testUser._id });
      
      expect(userSessions).toHaveLength(2);
      expect(userSessions.map(s => s.refreshToken)).toContain('refresh-token-1');
      expect(userSessions.map(s => s.refreshToken)).toContain('refresh-token-2');
    });
  });
});
