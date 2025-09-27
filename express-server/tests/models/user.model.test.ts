import { User } from '../../src/models/user.model';
import bcrypt from 'bcrypt';

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        userName: 'johndoe',
        email: 'john@example.com',
        password: await bcrypt.hash('Password123!', 12),
        gender: 'male',
        dob: new Date('1990-01-01')
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.firstName).toBe(userData.firstName);
      expect(savedUser.lastName).toBe(userData.lastName);
      expect(savedUser.userName).toBe(userData.userName);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.gender).toBe(userData.gender);
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    it('should not create user without required fields', async () => {
      const userData = {
        firstName: 'John',
        // Missing lastName, userName, email, password, gender, dob
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });

    it('should not create user with invalid gender', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        userName: 'johndoe',
        email: 'john@example.com',
        password: await bcrypt.hash('Password123!', 12),
        gender: 'invalid', // Invalid gender
        dob: new Date('1990-01-01')
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });

    it('should not create user with duplicate email', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        userName: 'johndoe',
        email: 'john@example.com',
        password: await bcrypt.hash('Password123!', 12),
        gender: 'male',
        dob: new Date('1990-01-01')
      };

      // Create first user
      await User.create(userData);

      // Try to create second user with same email
      const user2 = new User({
        ...userData,
        userName: 'johndoe2'
      });

      await expect(user2.save()).rejects.toThrow();
    });

    it('should not create user with duplicate username', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        userName: 'johndoe',
        email: 'john@example.com',
        password: await bcrypt.hash('Password123!', 12),
        gender: 'male',
        dob: new Date('1990-01-01')
      };

      // Create first user
      await User.create(userData);

      // Try to create second user with same username
      const user2 = new User({
        ...userData,
        email: 'john2@example.com'
      });

      await expect(user2.save()).rejects.toThrow();
    });
  });

  describe('User Validation', () => {
    it('should trim string fields', async () => {
      const userData = {
        firstName: '  John  ',
        lastName: '  Doe  ',
        userName: '  johndoe  ',
        email: '  JOHN@EXAMPLE.COM  ',
        password: await bcrypt.hash('Password123!', 12),
        gender: 'male',
        dob: new Date('1990-01-01')
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.firstName).toBe('John');
      expect(savedUser.lastName).toBe('Doe');
      expect(savedUser.userName).toBe('johndoe');
      expect(savedUser.email).toBe('john@example.com');
    });

    it('should set timestamps automatically', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        userName: 'johndoe',
        email: 'john@example.com',
        password: await bcrypt.hash('Password123!', 12),
        gender: 'male',
        dob: new Date('1990-01-01')
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
      expect(savedUser.createdAt).toBeInstanceOf(Date);
      expect(savedUser.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('User Queries', () => {
    beforeEach(async () => {
      // Create test users
      await User.create({
        firstName: 'John',
        lastName: 'Doe',
        userName: 'johndoe',
        email: 'john@example.com',
        password: await bcrypt.hash('Password123!', 12),
        gender: 'male',
        dob: new Date('1990-01-01')
      });

      await User.create({
        firstName: 'Jane',
        lastName: 'Smith',
        userName: 'janesmith',
        email: 'jane@example.com',
        password: await bcrypt.hash('Password123!', 12),
        gender: 'female',
        dob: new Date('1992-05-15')
      });
    });

    it('should find user by email', async () => {
      const user = await User.findOne({ email: 'john@example.com' });
      
      expect(user).toBeDefined();
      expect(user?.firstName).toBe('John');
      expect(user?.email).toBe('john@example.com');
    });

    it('should find user by username', async () => {
      const user = await User.findOne({ userName: 'janesmith' });
      
      expect(user).toBeDefined();
      expect(user?.firstName).toBe('Jane');
      expect(user?.userName).toBe('janesmith');
    });

    it('should find users by gender', async () => {
      const maleUsers = await User.find({ gender: 'male' });
      const femaleUsers = await User.find({ gender: 'female' });
      
      expect(maleUsers).toHaveLength(1);
      expect(femaleUsers).toHaveLength(1);
      expect(maleUsers[0].firstName).toBe('John');
      expect(femaleUsers[0].firstName).toBe('Jane');
    });

    it('should exclude password from query results', async () => {
      const user = await User.findOne({ email: 'john@example.com' }).select('-password');
      
      expect(user).toBeDefined();
      expect(user?.password).toBeUndefined();
    });
  });
});
