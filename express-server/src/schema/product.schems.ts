import { z as zodValidation } from "zod";

// Create Product Schema
export const createProductSchema = zodValidation.object({
    body: zodValidation.object({
        name: zodValidation.string()
            .min(2, "Product name must be at least 2 characters")
            .max(100, "Product name must be less than 100 characters")
            .trim(),
        description: zodValidation.string()
            .min(10, "Description must be at least 10 characters")
            .max(1000, "Description must be less than 1000 characters")
            .trim(),
        price: zodValidation.number()
            .positive("Price must be a positive number")
            .max(999999.99, "Price must be less than 1,000,000"),
        category: zodValidation.string()
            .min(2, "Category must be at least 2 characters")
            .max(50, "Category must be less than 50 characters")
            .trim(),
        brand: zodValidation.string()
            .min(2, "Brand must be at least 2 characters")
            .max(50, "Brand must be less than 50 characters")
            .trim()
            .optional(),
        stock: zodValidation.number()
            .int("Stock must be an integer")
            .min(0, "Stock cannot be negative")
            .max(999999, "Stock must be less than 1,000,000"),
        sku: zodValidation.string()
            .min(3, "SKU must be at least 3 characters")
            .max(50, "SKU must be less than 50 characters")
            .regex(/^[A-Z0-9-_]+$/, "SKU can only contain uppercase letters, numbers, hyphens, and underscores")
            .trim(),
        tags: zodValidation.array(zodValidation.string().trim())
            .min(1, "At least one tag is required")
            .max(10, "Maximum 10 tags allowed")
            .optional(),
        images: zodValidation.array(zodValidation.string().url("Invalid image URL"))
            .min(1, "At least one image is required")
            .max(10, "Maximum 10 images allowed")
            .optional(),
        specifications: zodValidation.record(zodValidation.string(), zodValidation.string())
            .optional(),
        isActive: zodValidation.boolean()
            .optional()
            .default(true)
    })
});

// Get Product by ID Schema
export const getProductByIdSchema = zodValidation.object({
    params: zodValidation.object({
        id: zodValidation.string()
            .regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID format")
    })
});

// Get All Products Schema
export const getAllProductsSchema = zodValidation.object({
    query: zodValidation.object({
        page: zodValidation.string()
            .regex(/^\d+$/, "Page must be a number")
            .optional()
            .default("1")
            .transform(Number)
            .refine((val) => val > 0, "Page must be greater than 0"),
        limit: zodValidation.string()
            .regex(/^\d+$/, "Limit must be a number")
            .optional()
            .default("10")
            .transform(Number)
            .refine((val) => val > 0 && val <= 100, "Limit must be between 1 and 100"),
        search: zodValidation.string()
            .min(1, "Search term must be at least 1 character")
            .max(100, "Search term must be less than 100 characters")
            .trim()
            .optional(),
        category: zodValidation.string()
            .min(1, "Category must be at least 1 character")
            .max(50, "Category must be less than 50 characters")
            .trim()
            .optional(),
        brand: zodValidation.string()
            .min(1, "Brand must be at least 1 character")
            .max(50, "Brand must be less than 50 characters")
            .trim()
            .optional(),
        minPrice: zodValidation.string()
            .regex(/^\d+(\.\d{1,2})?$/, "Invalid price format")
            .transform(Number)
            .refine((val) => val >= 0, "Minimum price cannot be negative")
            .optional(),
        maxPrice: zodValidation.string()
            .regex(/^\d+(\.\d{1,2})?$/, "Invalid price format")
            .transform(Number)
            .refine((val) => val >= 0, "Maximum price cannot be negative")
            .optional(),
        inStock: zodValidation.enum(['true', 'false'])
            .transform((val) => val === 'true')
            .optional(),
        sortBy: zodValidation.enum(['name', 'price', 'createdAt', 'stock'])
            .optional()
            .default('createdAt'),
        sortOrder: zodValidation.enum(['asc', 'desc'])
            .optional()
            .default('desc')
    })
});

// Update Product Schema
export const updateProductSchema = zodValidation.object({
    params: zodValidation.object({
        id: zodValidation.string()
            .regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID format")
    }),
    body: zodValidation.object({
        name: zodValidation.string()
            .min(2, "Product name must be at least 2 characters")
            .max(100, "Product name must be less than 100 characters")
            .trim()
            .optional(),
        description: zodValidation.string()
            .min(10, "Description must be at least 10 characters")
            .max(1000, "Description must be less than 1000 characters")
            .trim()
            .optional(),
        price: zodValidation.number()
            .positive("Price must be a positive number")
            .max(999999.99, "Price must be less than 1,000,000")
            .optional(),
        category: zodValidation.string()
            .min(2, "Category must be at least 2 characters")
            .max(50, "Category must be less than 50 characters")
            .trim()
            .optional(),
        brand: zodValidation.string()
            .min(2, "Brand must be at least 2 characters")
            .max(50, "Brand must be less than 50 characters")
            .trim()
            .optional(),
        stock: zodValidation.number()
            .int("Stock must be an integer")
            .min(0, "Stock cannot be negative")
            .max(999999, "Stock must be less than 1,000,000")
            .optional(),
        sku: zodValidation.string()
            .min(3, "SKU must be at least 3 characters")
            .max(50, "SKU must be less than 50 characters")
            .regex(/^[A-Z0-9-_]+$/, "SKU can only contain uppercase letters, numbers, hyphens, and underscores")
            .trim()
            .optional(),
        tags: zodValidation.array(zodValidation.string().trim())
            .min(1, "At least one tag is required")
            .max(10, "Maximum 10 tags allowed")
            .optional(),
        images: zodValidation.array(zodValidation.string().url("Invalid image URL"))
            .min(1, "At least one image is required")
            .max(10, "Maximum 10 images allowed")
            .optional(),
        specifications: zodValidation.record(zodValidation.string(), zodValidation.string())
            .optional(),
        isActive: zodValidation.boolean()
            .optional()
    })
});

// Delete Product Schema
export const deleteProductSchema = zodValidation.object({
    params: zodValidation.object({
        id: zodValidation.string()
            .regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID format")
    })
});

// Get Products by Category Schema
export const getProductsByCategorySchema = zodValidation.object({
    params: zodValidation.object({
        category: zodValidation.string()
            .min(1, "Category must be at least 1 character")
            .max(50, "Category must be less than 50 characters")
            .trim()
    }),
    query: zodValidation.object({
        page: zodValidation.string()
            .regex(/^\d+$/, "Page must be a number")
            .optional()
            .default("1")
            .transform(Number)
            .refine((val) => val > 0, "Page must be greater than 0"),
        limit: zodValidation.string()
            .regex(/^\d+$/, "Limit must be a number")
            .optional()
            .default("10")
            .transform(Number)
            .refine((val) => val > 0 && val <= 100, "Limit must be between 1 and 100"),
        sortBy: zodValidation.enum(['name', 'price', 'createdAt'])
            .optional()
            .default('createdAt'),
        sortOrder: zodValidation.enum(['asc', 'desc'])
            .optional()
            .default('desc')
    })
});

// Update Product Stock Schema
export const updateProductStockSchema = zodValidation.object({
    params: zodValidation.object({
        id: zodValidation.string()
            .regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID format")
    }),
    body: zodValidation.object({
        stock: zodValidation.number()
            .int("Stock must be an integer")
            .min(0, "Stock cannot be negative")
            .max(999999, "Stock must be less than 1,000,000"),
        operation: zodValidation.enum(['add', 'subtract', 'set'], {
            message: "Operation must be add, subtract, or set"
        })
            .optional()
            .default('set')
    })
});

// Type exports for TypeScript
export type CreateProductInput = zodValidation.infer<typeof createProductSchema>['body'];
export type GetProductByIdInput = zodValidation.infer<typeof getProductByIdSchema>['params'];
export type GetAllProductsInput = zodValidation.infer<typeof getAllProductsSchema>['query'];
export type UpdateProductInput = zodValidation.infer<typeof updateProductSchema>['body'];
export type UpdateProductParams = zodValidation.infer<typeof updateProductSchema>['params'];
export type DeleteProductInput = zodValidation.infer<typeof deleteProductSchema>['params'];
export type GetProductsByCategoryInput = zodValidation.infer<typeof getProductsByCategorySchema>['params'];
export type GetProductsByCategoryQuery = zodValidation.infer<typeof getProductsByCategorySchema>['query'];
export type UpdateProductStockInput = zodValidation.infer<typeof updateProductStockSchema>['body'];
export type UpdateProductStockParams = zodValidation.infer<typeof updateProductStockSchema>['params'];
