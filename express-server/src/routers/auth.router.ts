import { Router } from "express";
import {
    register,
    login,
    logout,
    refreshToken,
    forgotPassword,
    resetPassword
} from "../controller/auth.controller";

const router = Router();

// POST /api/auth/register
router.post("/register", register);

// POST /api/auth/login
router.post("/login", login);

// POST /api/auth/logout
router.post("/logout", logout);

// POST /api/auth/refresh
router.post("/refresh", refreshToken);

// POST /api/auth/forgot-password
router.post("/forgot-password", forgotPassword);

// POST /api/auth/reset-password
router.post("/reset-password", resetPassword);

export default router;
