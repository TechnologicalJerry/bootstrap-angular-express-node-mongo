import { Product } from '../../src/models/product.model';

describe('Product Model', () => {
  describe('Product Creation', () => {
    it('should create a product with valid data', async () => {
      const productData = {
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
      };

      const product = new Product(productData);
      const savedProduct = await product.save();

      expect(savedProduct._id).toBeDefined();
      expect(savedProduct.name).toBe(productData.name);
      expect(savedProduct.description).toBe(productData.description);
      expect(savedProduct.price).toBe(productData.price);
      expect(savedProduct.category).toBe(productData.category);
      expect(savedProduct.brand).toBe(productData.brand);
      expect(savedProduct.stock).toBe(productData.stock);
      expect(savedProduct.sku).toBe(productData.sku);
      expect(savedProduct.tags).toEqual(productData.tags);
      expect(savedProduct.images).toEqual(productData.images);
      expect(savedProduct.specifications).toEqual(productData.specifications);
      expect(savedProduct.isActive).toBe(productData.isActive);
      expect(savedProduct.createdAt).toBeDefined();
      expect(savedProduct.updatedAt).toBeDefined();
    });

    it('should not create product without required fields', async () => {
      const productData = {
        name: 'Test Product',
        // Missing description, price, category, stock
      };

      const product = new Product(productData);
      
      await expect(product.save()).rejects.toThrow();
    });

    it('should create product with minimal required fields', async () => {
      const productData = {
        name: 'Minimal Product',
        description: 'A minimal test product',
        price: 50.00,
        category: 'Test',
        stock: 5
      };

      const product = new Product(productData);
      const savedProduct = await product.save();

      expect(savedProduct._id).toBeDefined();
      expect(savedProduct.name).toBe(productData.name);
      expect(savedProduct.description).toBe(productData.description);
      expect(savedProduct.price).toBe(productData.price);
      expect(savedProduct.category).toBe(productData.category);
      expect(savedProduct.stock).toBe(productData.stock);
      expect(savedProduct.brand).toBeUndefined();
      expect(savedProduct.sku).toBeUndefined();
      expect(savedProduct.tags).toEqual([]);
      expect(savedProduct.images).toEqual([]);
      expect(savedProduct.specifications).toBeUndefined();
      expect(savedProduct.isActive).toBe(true); // Default value
    });

    it('should not create product with duplicate SKU', async () => {
      const productData = {
        name: 'Test Product',
        description: 'A test product',
        price: 99.99,
        category: 'Electronics',
        stock: 10,
        sku: 'TEST-001'
      };

      // Create first product
      await Product.create(productData);

      // Try to create second product with same SKU
      const product2 = new Product({
        ...productData,
        name: 'Test Product 2'
      });

      await expect(product2.save()).rejects.toThrow();
    });

    it('should allow products without SKU', async () => {
      const productData1 = {
        name: 'Product 1',
        description: 'First product without SKU',
        price: 99.99,
        category: 'Electronics',
        stock: 10
      };

      const productData2 = {
        name: 'Product 2',
        description: 'Second product without SKU',
        price: 149.99,
        category: 'Clothing',
        stock: 5
      };

      const product1 = new Product(productData1);
      const product2 = new Product(productData2);

      const savedProduct1 = await product1.save();
      const savedProduct2 = await product2.save();

      expect(savedProduct1._id).toBeDefined();
      expect(savedProduct2._id).toBeDefined();
      expect(savedProduct1.sku).toBeUndefined();
      expect(savedProduct2.sku).toBeUndefined();
    });
  });

  describe('Product Validation', () => {
    it('should trim string fields', async () => {
      const productData = {
        name: '  Test Product  ',
        description: '  A test product  ',
        price: 99.99,
        category: '  Electronics  ',
        brand: '  TestBrand  ',
        stock: 10,
        sku: '  TEST-001  '
      };

      const product = new Product(productData);
      const savedProduct = await product.save();

      expect(savedProduct.name).toBe('Test Product');
      expect(savedProduct.description).toBe('A test product');
      expect(savedProduct.category).toBe('Electronics');
      expect(savedProduct.brand).toBe('TestBrand');
      expect(savedProduct.sku).toBe('TEST-001');
    });

    it('should set timestamps automatically', async () => {
      const productData = {
        name: 'Test Product',
        description: 'A test product',
        price: 99.99,
        category: 'Electronics',
        stock: 10
      };

      const product = new Product(productData);
      const savedProduct = await product.save();

      expect(savedProduct.createdAt).toBeDefined();
      expect(savedProduct.updatedAt).toBeDefined();
      expect(savedProduct.createdAt).toBeInstanceOf(Date);
      expect(savedProduct.updatedAt).toBeInstanceOf(Date);
    });

    it('should set default values', async () => {
      const productData = {
        name: 'Test Product',
        description: 'A test product',
        price: 99.99,
        category: 'Electronics',
        stock: 10
      };

      const product = new Product(productData);
      const savedProduct = await product.save();

      expect(savedProduct.stock).toBe(10);
      expect(savedProduct.isActive).toBe(true);
    });
  });

  describe('Product Queries', () => {
    beforeEach(async () => {
      // Create test products
      await Product.create({
        name: 'Electronics Product',
        description: 'An electronics product',
        price: 199.99,
        category: 'Electronics',
        brand: 'TechBrand',
        stock: 15,
        sku: 'ELEC-001',
        tags: ['electronics', 'tech'],
        isActive: true
      });

      await Product.create({
        name: 'Clothing Product',
        description: 'A clothing product',
        price: 49.99,
        category: 'Clothing',
        brand: 'FashionBrand',
        stock: 25,
        sku: 'CLOTH-001',
        tags: ['clothing', 'fashion'],
        isActive: true
      });

      await Product.create({
        name: 'Book Product',
        description: 'A book product',
        price: 19.99,
        category: 'Books',
        stock: 0,
        sku: 'BOOK-001',
        tags: ['books', 'education'],
        isActive: false
      });
    });

    it('should find products by category', async () => {
      const electronicsProducts = await Product.find({ category: 'Electronics' });
      const clothingProducts = await Product.find({ category: 'Clothing' });
      
      expect(electronicsProducts).toHaveLength(1);
      expect(clothingProducts).toHaveLength(1);
      expect(electronicsProducts[0].name).toBe('Electronics Product');
      expect(clothingProducts[0].name).toBe('Clothing Product');
    });

    it('should find products by brand', async () => {
      const techProducts = await Product.find({ brand: 'TechBrand' });
      const fashionProducts = await Product.find({ brand: 'FashionBrand' });
      
      expect(techProducts).toHaveLength(1);
      expect(fashionProducts).toHaveLength(1);
      expect(techProducts[0].name).toBe('Electronics Product');
      expect(fashionProducts[0].name).toBe('Clothing Product');
    });

    it('should find products by SKU', async () => {
      const product = await Product.findOne({ sku: 'ELEC-001' });
      
      expect(product).toBeDefined();
      expect(product?.name).toBe('Electronics Product');
      expect(product?.category).toBe('Electronics');
    });

    it('should find products by price range', async () => {
      const expensiveProducts = await Product.find({ price: { $gte: 100 } });
      const cheapProducts = await Product.find({ price: { $lt: 50 } });
      
      expect(expensiveProducts).toHaveLength(1);
      expect(cheapProducts).toHaveLength(2); // Clothing (49.99) and Book (19.99)
      expect(expensiveProducts[0].name).toBe('Electronics Product');
      expect(cheapProducts.map(p => p.name)).toContain('Clothing Product');
      expect(cheapProducts.map(p => p.name)).toContain('Book Product');
    });

    it('should find products by stock status', async () => {
      const inStockProducts = await Product.find({ stock: { $gt: 0 } });
      const outOfStockProducts = await Product.find({ stock: { $lte: 0 } });
      
      expect(inStockProducts).toHaveLength(2);
      expect(outOfStockProducts).toHaveLength(1);
      expect(outOfStockProducts[0].name).toBe('Book Product');
    });

    it('should find products by active status', async () => {
      const activeProducts = await Product.find({ isActive: true });
      const inactiveProducts = await Product.find({ isActive: false });
      
      expect(activeProducts).toHaveLength(2);
      expect(inactiveProducts).toHaveLength(1);
      expect(inactiveProducts[0].name).toBe('Book Product');
    });

    it('should find products by tags', async () => {
      const techProducts = await Product.find({ tags: 'tech' });
      const fashionProducts = await Product.find({ tags: 'fashion' });
      
      expect(techProducts).toHaveLength(1);
      expect(fashionProducts).toHaveLength(1);
      expect(techProducts[0].name).toBe('Electronics Product');
      expect(fashionProducts[0].name).toBe('Clothing Product');
    });

    it('should search products by name', async () => {
      const products = await Product.find({ 
        name: { $regex: 'Product', $options: 'i' } 
      });
      
      expect(products).toHaveLength(3);
    });

    it('should sort products by price', async () => {
      const productsAsc = await Product.find({}).sort({ price: 1 });
      const productsDesc = await Product.find({}).sort({ price: -1 });
      
      expect(productsAsc[0].price).toBe(19.99);
      expect(productsDesc[0].price).toBe(199.99);
    });

    it('should paginate products', async () => {
      const page1 = await Product.find({}).limit(2).skip(0);
      const page2 = await Product.find({}).limit(2).skip(2);
      
      expect(page1).toHaveLength(2);
      expect(page2).toHaveLength(1);
    });
  });

  describe('Product Updates', () => {
    let product: any;

    beforeEach(async () => {
      product = await Product.create({
        name: 'Test Product',
        description: 'A test product',
        price: 99.99,
        category: 'Electronics',
        stock: 10,
        sku: 'TEST-001'
      });
    });

    it('should update product fields', async () => {
      const updateData = {
        name: 'Updated Product',
        price: 149.99,
        stock: 20
      };

      const updatedProduct = await Product.findByIdAndUpdate(
        product._id,
        updateData,
        { new: true }
      );

      expect(updatedProduct?.name).toBe('Updated Product');
      expect(updatedProduct?.price).toBe(149.99);
      expect(updatedProduct?.stock).toBe(20);
      expect(updatedProduct?.description).toBe('A test product'); // Unchanged
    });

    it('should update product stock', async () => {
      const updatedProduct = await Product.findByIdAndUpdate(
        product._id,
        { stock: 25 },
        { new: true }
      );

      expect(updatedProduct?.stock).toBe(25);
    });

    it('should update product tags', async () => {
      const updatedProduct = await Product.findByIdAndUpdate(
        product._id,
        { tags: ['updated', 'test'] },
        { new: true }
      );

      expect(updatedProduct?.tags).toEqual(['updated', 'test']);
    });

    it('should update product specifications', async () => {
      const specifications = { color: 'red', size: 'large' };
      const updatedProduct = await Product.findByIdAndUpdate(
        product._id,
        { specifications },
        { new: true }
      );

      expect(updatedProduct?.specifications).toEqual(specifications);
    });
  });
});
