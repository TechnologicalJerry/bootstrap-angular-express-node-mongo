import request from 'supertest';
import express from 'express';
import productsRouter from '../../src/routers/products.router';
import { Product } from '../../src/models/product.model';

// Create test app
const app = express();
app.use(express.json());
app.use('/products', productsRouter);

describe('Products Routes', () => {
  let testProduct: any;

  beforeEach(async () => {
    // Create test product
    testProduct = await Product.create({
      name: 'Test Product',
      description: 'A test product for testing',
      price: 99.99,
      category: 'Electronics',
      brand: 'TestBrand',
      stock: 10,
      sku: 'TEST-001',
      tags: ['test', 'electronics'],
      images: ['https://example.com/image1.jpg'],
      specifications: { color: 'black', weight: '1kg' },
      isActive: true
    });
  });

  describe('GET /products', () => {
    it('should get all products', async () => {
      const response = await request(app)
        .get('/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toHaveLength(1);
      expect(response.body.data.products[0].name).toBe('Test Product');
    });

    it('should get products with pagination', async () => {
      const response = await request(app)
        .get('/products?page=1&limit=10')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pagination).toMatchObject({
        currentPage: 1,
        totalPages: 1,
        totalProducts: 1
      });
    });

    it('should search products', async () => {
      const response = await request(app)
        .get('/products?search=Test')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toHaveLength(1);
    });

    it('should filter products by category', async () => {
      const response = await request(app)
        .get('/products?category=Electronics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toHaveLength(1);
    });

    it('should filter products by price range', async () => {
      const response = await request(app)
        .get('/products?minPrice=50&maxPrice=150')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toHaveLength(1);
    });
  });

  describe('GET /products/category/:category', () => {
    it('should get products by category', async () => {
      const response = await request(app)
        .get('/products/category/Electronics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toHaveLength(1);
      expect(response.body.data.category).toBe('Electronics');
    });

    it('should return empty array for non-existent category', async () => {
      const response = await request(app)
        .get('/products/category/NonExistent')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toHaveLength(0);
    });
  });

  describe('GET /products/:id', () => {
    it('should get product by ID', async () => {
      const response = await request(app)
        .get(`/products/${testProduct._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.product.name).toBe('Test Product');
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/products/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Product not found');
    });
  });

  describe('POST /products', () => {
    it('should create a new product', async () => {
      const productData = {
        name: 'New Product',
        description: 'A new test product',
        price: 149.99,
        category: 'Clothing',
        brand: 'NewBrand',
        stock: 5,
        sku: 'NEW-001',
        tags: ['new', 'clothing'],
        images: ['https://example.com/new-image.jpg'],
        specifications: { size: 'M', material: 'cotton' },
        isActive: true
      };

      const response = await request(app)
        .post('/products')
        .send(productData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.product.name).toBe(productData.name);
      expect(response.body.data.product.price).toBe(productData.price);
    });

    it('should not create product with existing SKU', async () => {
      const productData = {
        name: 'Duplicate Product',
        description: 'A product with duplicate SKU',
        price: 199.99,
        category: 'Electronics',
        stock: 3,
        sku: 'TEST-001' // Same SKU as test product
      };

      const response = await request(app)
        .post('/products')
        .send(productData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Product with this SKU already exists');
    });

    it('should require name field', async () => {
      const productData = {
        description: 'A product without name',
        price: 99.99,
        category: 'Electronics',
        stock: 10
      };

      const response = await request(app)
        .post('/products')
        .send(productData)
        .expect(500); // Mongoose validation error returns 500

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /products/:id', () => {
    it('should update product', async () => {
      const updateData = {
        name: 'Updated Product',
        price: 129.99,
        stock: 15
      };

      const response = await request(app)
        .put(`/products/${testProduct._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.product.name).toBe('Updated Product');
      expect(response.body.data.product.price).toBe(129.99);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const updateData = { name: 'Updated Product' };

      const response = await request(app)
        .put(`/products/${fakeId}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Product not found');
    });
  });

  describe('PATCH /products/:id/stock', () => {
    it('should update product stock', async () => {
      const stockData = {
        stock: 25,
        operation: 'set'
      };

      const response = await request(app)
        .patch(`/products/${testProduct._id}/stock`)
        .send(stockData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.stockChange.newStock).toBe(25);
    });

    it('should add to product stock', async () => {
      const stockData = {
        stock: 5,
        operation: 'add'
      };

      const response = await request(app)
        .patch(`/products/${testProduct._id}/stock`)
        .send(stockData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.stockChange.newStock).toBe(15);
    });

    it('should subtract from product stock', async () => {
      const stockData = {
        stock: 3,
        operation: 'subtract'
      };

      const response = await request(app)
        .patch(`/products/${testProduct._id}/stock`)
        .send(stockData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.stockChange.newStock).toBe(7);
    });

    it('should not allow negative stock', async () => {
      const stockData = {
        stock: 15, // More than current stock (10)
        operation: 'subtract'
      };

      const response = await request(app)
        .patch(`/products/${testProduct._id}/stock`)
        .send(stockData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Stock cannot be negative');
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const stockData = { stock: 10 };

      const response = await request(app)
        .patch(`/products/${fakeId}/stock`)
        .send(stockData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Product not found');
    });
  });

  describe('DELETE /products/:id', () => {
    it('should delete product', async () => {
      const response = await request(app)
        .delete(`/products/${testProduct._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Product deleted successfully');
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/products/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Product not found');
    });
  });
});
