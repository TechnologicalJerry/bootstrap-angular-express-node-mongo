import request from 'supertest';
import express from 'express';
import { register, login } from '../../src/controller/auth.controller';
import { User } from '../../src/models/user.model';
import bcrypt from 'bcrypt';

// Create test app
const app = express();
app.use(express.json());

// Mock routes
app.post('/auth/register', register);
app.post('/auth/login', login);

describe('Auth Controller', () => {
  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
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
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data.user).toMatchObject({
        firstName: userData.firstName,
        lastName: userData.lastName,
        userName: userData.userName,
        email: userData.email,
        gender: userData.gender
      });
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should not register user with existing email', async () => {
      // Create existing user
      await User.create({
        firstName: 'Jane',
        lastName: 'Doe',
        userName: 'janedoe',
        email: 'jane@example.com',
        password: await bcrypt.hash('Password123!', 12),
        gender: 'female',
        dob: new Date('1990-01-01')
      });

      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        userName: 'johndoe',
        email: 'jane@example.com', // Same email
        password: 'Password123!',
        gender: 'male',
        dob: '1990-01-01'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User with this email or username already exists');
    });

    it('should not register user with existing username', async () => {
      // Create existing user
      await User.create({
        firstName: 'Jane',
        lastName: 'Doe',
        userName: 'janedoe',
        email: 'jane@example.com',
        password: await bcrypt.hash('Password123!', 12),
        gender: 'female',
        dob: new Date('1990-01-01')
      });

      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        userName: 'janedoe', // Same username
        email: 'john@example.com',
        password: 'Password123!',
        gender: 'male',
        dob: '1990-01-01'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User with this email or username already exists');
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

    it('should login with email successfully', async () => {
      const loginData = {
        userId: 'john@example.com',
        password: 'Password123!'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.user).toMatchObject({
        firstName: 'John',
        lastName: 'Doe',
        userName: 'johndoe',
        email: 'john@example.com',
        gender: 'male'
      });
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should login with username successfully', async () => {
      const loginData = {
        userId: 'johndoe',
        password: 'Password123!'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.user).toMatchObject({
        firstName: 'John',
        lastName: 'Doe',
        userName: 'johndoe',
        email: 'john@example.com',
        gender: 'male'
      });
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should not login with invalid email', async () => {
      const loginData = {
        userId: 'invalid@example.com',
        password: 'Password123!'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email/username or password');
    });

    it('should not login with invalid password', async () => {
      const loginData = {
        userId: 'john@example.com',
        password: 'WrongPassword123!'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email/username or password');
    });
  });
});
