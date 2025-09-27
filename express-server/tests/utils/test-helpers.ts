import { User } from '../../src/models/user.model';
import bcrypt from 'bcrypt';

export const createTestUser = async (userData?: Partial<any>) => {
  const defaultUserData = {
    firstName: 'John',
    lastName: 'Doe',
    userName: 'johndoe',
    email: 'john@example.com',
    password: await bcrypt.hash('Password123!', 12),
    gender: 'male',
    dob: new Date('1990-01-01'),
    ...userData
  };

  return await User.create(defaultUserData);
};

export const createTestUsers = async (count: number = 3) => {
  const users = [];
  
  for (let i = 0; i < count; i++) {
    const user = await createTestUser({
      firstName: `User${i + 1}`,
      lastName: 'Test',
      userName: `user${i + 1}`,
      email: `user${i + 1}@example.com`
    });
    users.push(user);
  }
  
  return users;
};

export const generateJWTToken = (userId: string) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

export const mockRequest = (body: any = {}, params: any = {}, query: any = {}) => ({
  body,
  params,
  query,
  headers: {},
  user: null
});

export const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

export const mockNext = () => jest.fn();
