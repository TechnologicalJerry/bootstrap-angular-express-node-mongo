import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
    getUserSessions,
    getActiveSessions,
    terminateSession,
    terminateAllSessions,
    updateSessionActivity,
    getSessionStats
} from "../controller/session.controller";

const router = Router();

// All session routes require authentication
router.use(authenticate);

// GET /api/sessions/user/:userId - Get user session history
router.get("/user/:userId", getUserSessions);

// GET /api/sessions/user/:userId/active - Get active sessions for a user
router.get("/user/:userId/active", getActiveSessions);

// GET /api/sessions/active - Get current user's active sessions
router.get("/active", getActiveSessions);

// GET /api/sessions/stats/:userId - Get session statistics
router.get("/stats/:userId", getSessionStats);

// GET /api/sessions/stats - Get current user's session statistics
router.get("/stats", getSessionStats);

// DELETE /api/sessions/:sessionId - Terminate a specific session
router.delete("/:sessionId", terminateSession);

// DELETE /api/sessions/user/:userId/all - Terminate all sessions for a user
router.delete("/user/:userId/all", terminateAllSessions);

// DELETE /api/sessions/all - Terminate all sessions for current user
router.delete("/all", terminateAllSessions);

// PATCH /api/sessions/activity - Update session activity
router.patch("/activity", updateSessionActivity);

export default router;
