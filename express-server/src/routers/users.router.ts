import { Router, Request, Response } from "express";

const router = Router();

// GET /api/users
router.get("/", (req: Request, res: Response) => {
    res.json({ message: "Get all users" });
});

// GET /api/users/:id
router.get("/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    res.json({ message: `Get user with id: ${id}` });
});

// POST /api/users
router.post("/", (req: Request, res: Response) => {
    res.json({ message: "Create new user" });
});

// PUT /api/users/:id
router.put("/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    res.json({ message: `Update user with id: ${id}` });
});

// DELETE /api/users/:id
router.delete("/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    res.json({ message: `Delete user with id: ${id}` });
});

export default router;
