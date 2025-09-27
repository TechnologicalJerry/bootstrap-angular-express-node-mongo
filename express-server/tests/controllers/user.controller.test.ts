import request from 'supertest';
import express from 'express';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from '../../src/controller/user.controller';
import { User } from '../../src/models/user.model';
import bcrypt from 'bcrypt';

// Create test app
const app = express();
app.use(express.json());

// Mock routes
app.get('/users', getAllUsers);
app.get('/users/:id', getUserById);
app.post('/users', createUser);
app.put('/users/:id', updateUser);
app.delete('/users/:id', deleteUser);

describe('User Controller', () => {
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
    it('should get all users with pagination', async () => {
      const response = await request(app)
        .get('/users')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Users retrieved successfully');
      expect(response.body.data.users).toHaveLength(1);
      expect(response.body.data.pagination).toMatchObject({
        currentPage: 1,
        totalPages: 1,
        totalUsers: 1,
        hasNextPage: false,
        hasPrevPage: false
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
      expect(response.body.message).toBe('User retrieved successfully');
      expect(response.body.data.user).toMatchObject({
        firstName: 'John',
        lastName: 'Doe',
        userName: 'johndoe',
        email: 'john@example.com',
        gender: 'male'
      });
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
      expect(response.body.message).toBe('User created successfully');
      expect(response.body.data.user).toMatchObject({
        firstName: userData.firstName,
        lastName: userData.lastName,
        userName: userData.userName,
        email: userData.email,
        gender: userData.gender
      });
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
  });

  describe('PUT /users/:id', () => {
    it('should update user successfully', async () => {
      const updateData = {
        firstName: 'Johnny',
        lastName: 'Doe'
      };

      const response = await request(app)
        .put(`/users/${testUser._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User updated successfully');
      expect(response.body.data.user).toMatchObject({
        firstName: 'Johnny',
        lastName: 'Doe',
        userName: 'johndoe',
        email: 'john@example.com'
      });
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
  });

  describe('DELETE /users/:id', () => {
    it('should delete user successfully', async () => {
      const response = await request(app)
        .delete(`/users/${testUser._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User deleted successfully');

      // Verify user is deleted
      const deletedUser = await User.findById(testUser._id);
      expect(deletedUser).toBeNull();
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/users/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });
  });
});
