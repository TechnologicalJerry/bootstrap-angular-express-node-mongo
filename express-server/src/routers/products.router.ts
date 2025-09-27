import { Router, Request, Response } from "express";

const router = Router();

// GET /api/products
router.get("/", (req: Request, res: Response) => {
    res.json({ message: "Get all products" });
});

// GET /api/products/:id
router.get("/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    res.json({ message: `Get product with id: ${id}` });
});

// POST /api/products
router.post("/", (req: Request, res: Response) => {
    res.json({ message: "Create new product" });
});

// PUT /api/products/:id
router.put("/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    res.json({ message: `Update product with id: ${id}` });
});

// DELETE /api/products/:id
router.delete("/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    res.json({ message: `Delete product with id: ${id}` });
});

// GET /api/products/category/:category
router.get("/category/:category", (req: Request, res: Response) => {
    const { category } = req.params;
    res.json({ message: `Get products by category: ${category}` });
});

export default router;
