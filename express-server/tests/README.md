# Testing Guide

This directory contains comprehensive tests for the Express server application.

## Test Structure

```
tests/
├── controllers/          # Controller unit tests
├── models/              # Model unit tests
├── routes/              # Route integration tests
├── utils/               # Test utilities and helpers
├── setup.ts             # Test setup and configuration
└── README.md            # This file
```

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### CI Mode
```bash
npm run test:ci
```

## Test Categories

### 1. Controller Tests
- **Location**: `tests/controllers/`
- **Purpose**: Test individual controller functions
- **Examples**: 
  - `auth.controller.test.ts` - Authentication logic
  - `user.controller.test.ts` - User management logic
  - `product.controller.test.ts` - Product management logic

### 2. Model Tests
- **Location**: `tests/models/`
- **Purpose**: Test Mongoose models and database operations
- **Examples**:
  - `user.model.test.ts` - User model validation and queries
  - `product.model.test.ts` - Product model validation and queries

### 3. Route Tests
- **Location**: `tests/routes/`
- **Purpose**: Test API endpoints and route integration
- **Examples**:
  - `auth.routes.test.ts` - Authentication endpoints
  - `user.routes.test.ts` - User management endpoints

### 4. Utility Tests
- **Location**: `tests/utils/`
- **Purpose**: Test utility functions and helpers
- **Examples**:
  - `test-helpers.ts` - Test helper functions

## Test Setup

### Database
- Uses **MongoDB Memory Server** for in-memory testing
- Automatically creates and cleans up test database
- No external database required

### Environment
- Test environment variables are set in `setup.ts`
- JWT secrets and other configs are mocked for testing

### Mocking
- External services are mocked where appropriate
- Database operations use in-memory MongoDB
- File system operations are mocked

## Writing Tests

### Test Structure
```typescript
describe('Feature Name', () => {
  beforeEach(async () => {
    // Setup before each test
  });

  afterEach(async () => {
    // Cleanup after each test
  });

  describe('Method Name', () => {
    it('should do something', async () => {
      // Test implementation
      expect(result).toBe(expected);
    });
  });
});
```

### Test Helpers
Use the helper functions in `tests/utils/test-helpers.ts`:

```typescript
import { createTestUser, mockRequest, mockResponse } from '../utils/test-helpers';

// Create test data
const user = await createTestUser({ email: 'test@example.com' });

// Mock request/response
const req = mockRequest({ email: 'test@example.com' });
const res = mockResponse();
```

### Assertions
- Use Jest's built-in matchers
- Test both success and error cases
- Verify response structure and status codes
- Check database state changes

## Coverage

The test suite aims for:
- **Statements**: > 80%
- **Branches**: > 80%
- **Functions**: > 80%
- **Lines**: > 80%

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Clean up test data after each test
3. **Descriptive Names**: Use clear, descriptive test names
4. **Single Responsibility**: Test one thing per test case
5. **Mock External Dependencies**: Don't rely on external services
6. **Test Edge Cases**: Include error scenarios and edge cases
7. **Fast Execution**: Keep tests fast and efficient

## Debugging Tests

### Running Specific Tests
```bash
# Run specific test file
npm test auth.controller.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should login"

# Run tests in specific directory
npm test tests/controllers/
```

### Debug Mode
```bash
# Run tests with debug output
npm test -- --verbose

# Run single test with debug
npm test -- --testNamePattern="should login" --verbose
```

## Continuous Integration

Tests are configured to run in CI environments with:
- Coverage reporting
- No watch mode
- Exit on completion
- Parallel execution

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure MongoDB Memory Server is properly installed
2. **Timeout Issues**: Increase test timeout in `jest.config.js`
3. **Memory Leaks**: Check for proper cleanup in `afterEach` hooks
4. **Async Issues**: Use `async/await` properly in tests

### Performance

- Tests should complete in under 30 seconds
- Use parallel execution for faster runs
- Clean up resources properly to avoid memory leaks
