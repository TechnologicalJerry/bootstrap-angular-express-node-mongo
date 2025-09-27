import { Router } from "express";
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    changeUserPassword,
    getUserProfile
} from "../controller/user.controller";

const router = Router();

// GET /api/users - Get all users with pagination and search
router.get("/", getAllUsers);

// GET /api/users/:id - Get user by ID
router.get("/:id", getUserById);

// POST /api/users - Create new user
router.post("/", createUser);

// PUT /api/users/:id - Update user
router.put("/:id", updateUser);

// DELETE /api/users/:id - Delete user
router.delete("/:id", deleteUser);

// PATCH /api/users/:id/password - Change user password
router.patch("/:id/password", changeUserPassword);

// GET /api/users/:id/profile - Get user profile
router.get("/:id/profile", getUserProfile);

export default router;
