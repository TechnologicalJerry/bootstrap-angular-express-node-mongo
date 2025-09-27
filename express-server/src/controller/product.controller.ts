import { Request, Response } from 'express';
import { Product } from '../models/product.model';
import log from '../utilitys/logger';

// Get all products with pagination, search, and filters
export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            search, 
            category, 
            brand, 
            minPrice, 
            maxPrice, 
            inStock, 
            sortBy = 'createdAt', 
            sortOrder = 'desc' 
        } = req.query;

        // Build search query
        const searchQuery: any = {};
        
        if (search) {
            searchQuery.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }

        if (category) {
            searchQuery.category = { $regex: category, $options: 'i' };
        }

        if (brand) {
            searchQuery.brand = { $regex: brand, $options: 'i' };
        }

        if (minPrice || maxPrice) {
            searchQuery.price = {};
            if (minPrice) searchQuery.price.$gte = Number(minPrice);
            if (maxPrice) searchQuery.price.$lte = Number(maxPrice);
        }

        if (inStock !== undefined) {
            if (inStock === 'true') {
                searchQuery.stock = { $gt: 0 };
            } else {
                searchQuery.stock = { $lte: 0 };
            }
        }

        // Build sort object
        const sortObj: any = {};
        sortObj[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

        // Calculate pagination
        const skip = (Number(page) - 1) * Number(limit);

        // Execute query
        const products = await Product.find(searchQuery)
            .sort(sortObj)
            .skip(skip)
            .limit(Number(limit));

        const totalProducts = await Product.countDocuments(searchQuery);
        const totalPages = Math.ceil(totalProducts / Number(limit));

        log.info({
            totalProducts,
            page: Number(page),
            limit: Number(limit),
            search,
            category,
            brand
        }, 'Products retrieved successfully');

        res.status(200).json({
            success: true,
            message: 'Products retrieved successfully',
            data: {
                products,
                pagination: {
                    currentPage: Number(page),
                    totalPages,
                    totalProducts,
                    hasNextPage: Number(page) < totalPages,
                    hasPrevPage: Number(page) > 1
                }
            }
        });

    } catch (error: any) {
        log.error({ error: error.message }, 'Error retrieving products');
        res.status(500).json({
            success: false,
            message: 'Internal server error while retrieving products'
        });
    }
};

// Get product by ID
export const getProductById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        log.info({
            productId: product._id,
            name: product.name
        }, 'Product retrieved successfully');

        res.status(200).json({
            success: true,
            message: 'Product retrieved successfully',
            data: { product }
        });

    } catch (error: any) {
        log.error({ error: error.message }, 'Error retrieving product');
        res.status(500).json({
            success: false,
            message: 'Internal server error while retrieving product'
        });
    }
};

// Create new product
export const createProduct = async (req: Request, res: Response) => {
    try {
        const { name, description, price, category, brand, stock, sku, tags, images, specifications, isActive } = req.body;

        // Check if product with same SKU already exists
        if (sku) {
            const existingProduct = await Product.findOne({ sku });
            if (existingProduct) {
                return res.status(400).json({
                    success: false,
                    message: 'Product with this SKU already exists'
                });
            }
        }

        // Create new product
        const newProduct = new Product({
            name,
            description,
            price,
            category,
            brand,
            stock: stock || 0,
            sku,
            tags,
            images,
            specifications,
            isActive: isActive !== undefined ? isActive : true
        });

        await newProduct.save();

        log.info({
            productId: newProduct._id,
            name: newProduct.name,
            sku: newProduct.sku
        }, 'Product created successfully');

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: { product: newProduct }
        });

    } catch (error: any) {
        log.error({ error: error.message }, 'Error creating product');
        res.status(500).json({
            success: false,
            message: 'Internal server error while creating product'
        });
    }
};

// Update product
export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Check if product exists
        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check for SKU conflicts if SKU is being updated
        if (updateData.sku) {
            const conflictingProduct = await Product.findOne({ 
                sku: updateData.sku, 
                _id: { $ne: id } 
            });
            if (conflictingProduct) {
                return res.status(400).json({
                    success: false,
                    message: 'Product with this SKU already exists'
                });
            }
        }

        // Update product
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        log.info({
            productId: id,
            name: updatedProduct?.name,
            updatedFields: Object.keys(updateData)
        }, 'Product updated successfully');

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: { product: updatedProduct }
        });

    } catch (error: any) {
        log.error({ error: error.message }, 'Error updating product');
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating product'
        });
    }
};

// Delete product
export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        await Product.findByIdAndDelete(id);

        log.info({
            productId: id,
            name: product.name,
            sku: product.sku
        }, 'Product deleted successfully');

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });

    } catch (error: any) {
        log.error({ error: error.message }, 'Error deleting product');
        res.status(500).json({
            success: false,
            message: 'Internal server error while deleting product'
        });
    }
};

// Get products by category
export const getProductsByCategory = async (req: Request, res: Response) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        // Build sort object
        const sortObj: any = {};
        sortObj[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

        // Calculate pagination
        const skip = (Number(page) - 1) * Number(limit);

        // Execute query
        const products = await Product.find({ 
            category: { $regex: category, $options: 'i' } 
        })
            .sort(sortObj)
            .skip(skip)
            .limit(Number(limit));

        const totalProducts = await Product.countDocuments({ 
            category: { $regex: category, $options: 'i' } 
        });
        const totalPages = Math.ceil(totalProducts / Number(limit));

        log.info({
            category,
            totalProducts,
            page: Number(page),
            limit: Number(limit)
        }, 'Products by category retrieved successfully');

        res.status(200).json({
            success: true,
            message: `Products in category '${category}' retrieved successfully`,
            data: {
                products,
                category,
                pagination: {
                    currentPage: Number(page),
                    totalPages,
                    totalProducts,
                    hasNextPage: Number(page) < totalPages,
                    hasPrevPage: Number(page) > 1
                }
            }
        });

    } catch (error: any) {
        log.error({ error: error.message }, 'Error retrieving products by category');
        res.status(500).json({
            success: false,
            message: 'Internal server error while retrieving products by category'
        });
    }
};

// Update product stock
export const updateProductStock = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { stock, operation = 'set' } = req.body;

        // Check if product exists
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        let newStock = stock;
        
        // Handle different operations
        if (operation === 'add') {
            newStock = product.stock + stock;
        } else if (operation === 'subtract') {
            newStock = product.stock - stock;
            if (newStock < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Stock cannot be negative'
                });
            }
        }
        // 'set' operation uses the provided stock value directly

        // Update stock
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { stock: newStock },
            { new: true, runValidators: true }
        );

        log.info({
            productId: id,
            name: product.name,
            oldStock: product.stock,
            newStock,
            operation
        }, 'Product stock updated successfully');

        res.status(200).json({
            success: true,
            message: 'Product stock updated successfully',
            data: { 
                product: updatedProduct,
                stockChange: {
                    oldStock: product.stock,
                    newStock,
                    operation
                }
            }
        });

    } catch (error: any) {
        log.error({ error: error.message }, 'Error updating product stock');
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating product stock'
        });
    }
};
