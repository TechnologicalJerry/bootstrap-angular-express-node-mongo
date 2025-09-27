import request from 'supertest';
import express from 'express';
import usersRouter from '../../src/routers/users.router';
import { User } from '../../src/models/user.model';
import bcrypt from 'bcrypt';

// Create test app
const app = express();
app.use(express.json());
app.use('/users', usersRouter);

describe('Users Routes', () => {
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

  describe('GET /users', () => {
    it('should get all users', async () => {
      const response = await request(app)
        .get('/users')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toHaveLength(1);
      expect(response.body.data.users[0].firstName).toBe('John');
    });

    it('should get users with pagination', async () => {
      const response = await request(app)
        .get('/users?page=1&limit=10')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pagination).toMatchObject({
        currentPage: 1,
        totalPages: 1,
        totalUsers: 1
      });
    });

    it('should search users by name', async () => {
      const response = await request(app)
        .get('/users?search=John')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toHaveLength(1);
      expect(response.body.data.users[0].firstName).toBe('John');
    });

    it('should sort users by name', async () => {
      const response = await request(app)
        .get('/users?sortBy=firstName&sortOrder=asc')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toHaveLength(1);
    });

    it('should return empty array for non-matching search', async () => {
      const response = await request(app)
        .get('/users?search=Jane')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toHaveLength(0);
    });
  });

  describe('GET /users/:id', () => {
    it('should get user by ID', async () => {
      const response = await request(app)
        .get(`/users/${testUser._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.firstName).toBe('John');
      expect(response.body.data.user.email).toBe('john@example.com');
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/users/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });

    it('should return 400 for invalid user ID format', async () => {
      const response = await request(app)
        .get('/users/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const userData = {
        firstName: 'Jane',
        lastName: 'Smith',
        userName: 'janesmith',
        email: 'jane@example.com',
        password: 'Password123!',
        gender: 'female',
        dob: '1992-05-15'
      };

      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.firstName).toBe(userData.firstName);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should not create user with existing email', async () => {
      const userData = {
        firstName: 'Jane',
        lastName: 'Smith',
        userName: 'janesmith',
        email: 'john@example.com', // Same email as test user
        password: 'Password123!',
        gender: 'female',
        dob: '1992-05-15'
      };

      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User with this email or username already exists');
    });

    it('should not create user with existing username', async () => {
      const userData = {
        firstName: 'Jane',
        lastName: 'Smith',
        userName: 'johndoe', // Same username as test user
        email: 'jane@example.com',
        password: 'Password123!',
        gender: 'female',
        dob: '1992-05-15'
      };

      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User with this email or username already exists');
    });

    it('should require name field', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        gender: 'male',
        dob: '1990-01-01'
      };

      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect(500); // Mongoose validation error

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /users/:id', () => {
    it('should update user', async () => {
      const updateData = {
        firstName: 'Johnny',
        lastName: 'Doe'
      };

      const response = await request(app)
        .put(`/users/${testUser._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.firstName).toBe('Johnny');
      expect(response.body.data.user.lastName).toBe('Doe');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const updateData = { firstName: 'Johnny' };

      const response = await request(app)
        .put(`/users/${fakeId}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });

    it('should return 400 for invalid user ID format', async () => {
      const updateData = { firstName: 'Johnny' };

      const response = await request(app)
        .put('/users/invalid-id')
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /users/:id/password', () => {
    it('should change user password', async () => {
      const passwordData = {
        newPassword: 'NewPassword123!'
      };

      const response = await request(app)
        .patch(`/users/${testUser._id}/password`)
        .send(passwordData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Password changed successfully');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const passwordData = { newPassword: 'NewPassword123!' };

      const response = await request(app)
        .patch(`/users/${fakeId}/password`)
        .send(passwordData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });

    it('should return 400 for invalid user ID format', async () => {
      const passwordData = { newPassword: 'NewPassword123!' };

      const response = await request(app)
        .patch('/users/invalid-id/password')
        .send(passwordData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /users/:id/profile', () => {
    it('should get user profile', async () => {
      const response = await request(app)
        .get(`/users/${testUser._id}/profile`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.firstName).toBe('John');
      expect(response.body.data.user.email).toBe('john@example.com');
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/users/${fakeId}/profile`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });

    it('should return 400 for invalid user ID format', async () => {
      const response = await request(app)
        .get('/users/invalid-id/profile')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user', async () => {
      const response = await request(app)
        .delete(`/users/${testUser._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User deleted successfully');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/users/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });

    it('should return 400 for invalid user ID format', async () => {
      const response = await request(app)
        .delete('/users/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
