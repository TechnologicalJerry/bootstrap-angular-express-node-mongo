# Postman Collection for Express Server API

This directory contains Postman collection and environment files for testing the Express Server API.

## Files

- `Express-Server-API.postman_collection.json` - Complete API collection
- `Express-Server-Environment.postman_environment.json` - Environment variables
- `README.md` - This documentation

## Setup Instructions

### 1. Import Collection and Environment

1. Open Postman
2. Click **Import** button
3. Select both files:
   - `Express-Server-API.postman_collection.json`
   - `Express-Server-Environment.postman_environment.json`
4. Click **Import**

### 2. Set Environment

1. In Postman, click the environment dropdown (top right)
2. Select **Express Server Environment**
3. Verify the `base_url` is set to `http://localhost:5050`

### 3. Start the Server

```bash
npm run dev
```

The server should start on `http://localhost:5050`

## API Endpoints

### Health Check
- **GET** `/api/healthcheck` - Check server status

### Authentication
- **POST** `/api/auth/register` - Register new user
- **POST** `/api/auth/login` - Login with email or username
- **POST** `/api/auth/logout` - Logout user
- **POST** `/api/auth/refresh` - Refresh access token
- **POST** `/api/auth/forgot-password` - Request password reset
- **POST** `/api/auth/reset-password` - Reset password with token

### Users
- **GET** `/api/users` - Get all users (with pagination, search, sorting)
- **GET** `/api/users/:id` - Get user by ID
- **POST** `/api/users` - Create new user
- **PUT** `/api/users/:id` - Update user
- **PATCH** `/api/users/:id/password` - Change user password
- **GET** `/api/users/:id/profile` - Get user profile
- **DELETE** `/api/users/:id` - Delete user

### Products
- **GET** `/api/products` - Get all products (with pagination, search, filters)
- **GET** `/api/products/category/:category` - Get products by category
- **GET** `/api/products/:id` - Get product by ID
- **POST** `/api/products` - Create new product
- **PUT** `/api/products/:id` - Update product
- **PATCH** `/api/products/:id/stock` - Update product stock
- **DELETE** `/api/products/:id` - Delete product

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `base_url` | API base URL | `http://localhost:5050` |
| `access_token` | JWT access token | Auto-populated after login |
| `refresh_token` | JWT refresh token | Auto-populated after login |
| `user_id` | User ID for testing | Auto-populated after user creation |
| `product_id` | Product ID for testing | Auto-populated after product creation |
| `reset_token` | Password reset token | Manual entry when needed |

## Testing Workflow

### 1. Health Check
Start with the **Health Check** request to verify the server is running.

### 2. Authentication Flow
1. **Register User** - Create a new user account
2. **Login** - Login with email or username
3. Copy the `access_token` and `refresh_token` from the response
4. Set them in the environment variables

### 3. User Management
1. **Get All Users** - Test pagination and search
2. **Create User** - Create additional users
3. **Update User** - Modify user information
4. **Change Password** - Test password change
5. **Get User Profile** - Retrieve user profile
6. **Delete User** - Remove user account

### 4. Product Management
1. **Create Product** - Add new products
2. **Get All Products** - Test filtering and search
3. **Get Products by Category** - Filter by category
4. **Update Product** - Modify product information
5. **Update Product Stock** - Test stock operations (set, add, subtract)
6. **Delete Product** - Remove products

## Request Examples

### Register User
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "userName": "johndoe",
  "email": "john@example.com",
  "password": "Password123!",
  "gender": "male",
  "dob": "1990-01-01"
}
```

### Login
```json
{
  "userId": "john@example.com",
  "password": "Password123!"
}
```

### Create Product
```json
{
  "name": "iPhone 15 Pro",
  "description": "Latest iPhone with advanced features",
  "price": 999.99,
  "category": "Electronics",
  "brand": "Apple",
  "stock": 50,
  "sku": "IPH15PRO-001",
  "tags": ["smartphone", "apple", "electronics"],
  "images": ["https://example.com/iphone15pro.jpg"],
  "specifications": {
    "color": "Space Black",
    "storage": "256GB",
    "screen": "6.1 inch"
  },
  "isActive": true
}
```

### Update Product Stock
```json
{
  "stock": 25,
  "operation": "set"
}
```

## Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer {{access_token}}
```

## Pagination

List endpoints support pagination:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

## Search and Filtering

### Users
- `search` - Search by name, username, or email
- `sortBy` - Sort field (firstName, lastName, userName, email, createdAt)
- `sortOrder` - Sort direction (asc, desc)

### Products
- `search` - Search by name or description
- `category` - Filter by category
- `brand` - Filter by brand
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `inStock` - Stock availability filter (true/false)
- `sortBy` - Sort field (name, price, category, createdAt, stock)
- `sortOrder` - Sort direction (asc, desc)

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 500 | Internal Server Error |

## Tips

1. **Save Responses**: Use Postman's "Save Response" feature to store example responses
2. **Environment Variables**: Update environment variables after successful requests
3. **Test Scripts**: Add test scripts to automatically extract tokens and IDs
4. **Collections**: Organize requests into folders for better management
5. **Documentation**: Use Postman's documentation feature to generate API docs

## Troubleshooting

### Common Issues

1. **Connection Refused**: Ensure the server is running on the correct port
2. **401 Unauthorized**: Check if the access token is valid and not expired
3. **404 Not Found**: Verify the endpoint URL and HTTP method
4. **400 Bad Request**: Check request body format and required fields

### Server Logs

Monitor server logs for detailed error information:

```bash
npm run dev
```

### Environment Variables

Ensure all environment variables are set correctly:
- `base_url` should match your server URL
- `access_token` should be valid JWT token
- `user_id` and `product_id` should be valid MongoDB ObjectIds

## Support

For issues or questions:
1. Check server logs
2. Verify environment variables
3. Test with curl or other HTTP clients
4. Review API documentation
