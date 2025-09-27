import request from 'supertest';
import express from 'express';
import authRouter from '../../src/routers/auth.router';
import { User } from '../../src/models/user.model';
import bcrypt from 'bcrypt';

// Create test app
const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('Auth Routes', () => {
  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        userName: 'johndoe',
        email: 'john@example.com',
        password: 'Password123!',
        gender: 'male',
        dob: '1990-01-01'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.accessToken).toBeDefined();
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Create test user
      await User.create({
        firstName: 'John',
        lastName: 'Doe',
        userName: 'johndoe',
        email: 'john@example.com',
        password: await bcrypt.hash('Password123!', 12),
        gender: 'male',
        dob: new Date('1990-01-01')
      });
    });

    it('should login with email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          userId: 'john@example.com',
          password: 'Password123!'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should login with username', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          userId: 'johndoe',
          password: 'Password123!'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout successful');
    });
  });

  describe('POST /auth/refresh', () => {
    it('should require refresh token', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({})
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Refresh token is required');
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('should handle forgot password request', async () => {
      const response = await request(app)
        .post('/auth/forgot-password')
        .send({ email: 'test@example.com' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('If the email exists');
    });
  });

  describe('POST /auth/reset-password', () => {
    it('should require token and new password', async () => {
      const response = await request(app)
        .post('/auth/reset-password')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Token and new password are required');
    });
  });
});
