import { Router } from "express";
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
    updateProductStock
} from "../controller/product.controller";

const router = Router();

// GET /api/products - Get all products with pagination, search, and filters
router.get("/", getAllProducts);

// GET /api/products/category/:category - Get products by category
router.get("/category/:category", getProductsByCategory);

// GET /api/products/:id - Get product by ID
router.get("/:id", getProductById);

// POST /api/products - Create new product
router.post("/", createProduct);

// PUT /api/products/:id - Update product
router.put("/:id", updateProduct);

// PATCH /api/products/:id/stock - Update product stock
router.patch("/:id/stock", updateProductStock);

// DELETE /api/products/:id - Delete product
router.delete("/:id", deleteProduct);

export default router;
