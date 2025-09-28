import { Request, Response } from 'express';
import { SessionLog } from '../models/session-log.model';
import { User } from '../models/user.model';
import log from '../utilitys/logger';

// Get user session history
export const getUserSessions = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId || req.user?._id;
        const { page = 1, limit = 10, activeOnly = false } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Build query
        const query: any = { userId };
        if (activeOnly === 'true') {
            query.isActive = true;
            query.expiresAt = { $gt: new Date() };
        }

        // Calculate pagination
        const skip = (Number(page) - 1) * Number(limit);

        // Get sessions with pagination
        const sessions = await SessionLog.find(query)
            .sort({ loginTime: -1 })
            .skip(skip)
            .limit(Number(limit))
            .populate('userId', 'firstName lastName userName email');

        const totalSessions = await SessionLog.countDocuments(query);

        log.info({
            userId,
            totalSessions,
            page,
            limit
        }, 'User sessions retrieved');

        res.status(200).json({
            success: true,
            data: {
                sessions,
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(totalSessions / Number(limit)),
                    totalSessions,
                    hasNextPage: Number(page) < Math.ceil(totalSessions / Number(limit)),
                    hasPrevPage: Number(page) > 1
                }
            }
        });

    } catch (error: any) {
        log.error({ error: error.message }, 'Error getting user sessions');
        res.status(500).json({
            success: false,
            message: 'Internal server error while retrieving sessions'
        });
    }
};

// Get active sessions for a user
export const getActiveSessions = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId || req.user?._id;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const activeSessions = await SessionLog.findActiveSessions(userId);

        log.info({
            userId,
            activeSessionCount: activeSessions.length
        }, 'Active sessions retrieved');

        res.status(200).json({
            success: true,
            data: {
                sessions: activeSessions,
                count: activeSessions.length
            }
        });

    } catch (error: any) {
        log.error({ error: error.message }, 'Error getting active sessions');
        res.status(500).json({
            success: false,
            message: 'Internal server error while retrieving active sessions'
        });
    }
};

// Terminate a specific session
export const terminateSession = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user?._id;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: 'Session ID is required'
            });
        }

        const session = await SessionLog.findBySessionId(sessionId);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        // Check if user can terminate this session (own session or admin)
        if (session.userId.toString() !== userId?.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only terminate your own sessions'
            });
        }

        await session.logout();

        log.info({
            sessionId,
            userId: session.userId
        }, 'Session terminated');

        res.status(200).json({
            success: true,
            message: 'Session terminated successfully'
        });

    } catch (error: any) {
        log.error({ error: error.message }, 'Error terminating session');
        res.status(500).json({
            success: false,
            message: 'Internal server error while terminating session'
        });
    }
};

// Terminate all sessions for a user
export const terminateAllSessions = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId || req.user?._id;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const result = await SessionLog.deactivateAllUserSessions(userId);

        log.info({
            userId,
            terminatedSessions: result.modifiedCount
        }, 'All user sessions terminated');

        res.status(200).json({
            success: true,
            message: 'All sessions terminated successfully',
            data: {
                terminatedSessions: result.modifiedCount
            }
        });

    } catch (error: any) {
        log.error({ error: error.message }, 'Error terminating all sessions');
        res.status(500).json({
            success: false,
            message: 'Internal server error while terminating all sessions'
        });
    }
};

// Update session activity
export const updateSessionActivity = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: 'Session ID is required'
            });
        }

        const session = await SessionLog.findBySessionId(sessionId);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        await session.updateActivity();

        res.status(200).json({
            success: true,
            message: 'Session activity updated'
        });

    } catch (error: any) {
        log.error({ error: error.message }, 'Error updating session activity');
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating session activity'
        });
    }
};

// Get session statistics
export const getSessionStats = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId || req.user?._id;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const [
            totalSessions,
            activeSessions,
            todaySessions,
            deviceStats
        ] = await Promise.all([
            SessionLog.countDocuments({ userId }),
            SessionLog.countDocuments({ 
                userId, 
                isActive: true,
                expiresAt: { $gt: new Date() }
            }),
            SessionLog.countDocuments({
                userId,
                loginTime: {
                    $gte: new Date(new Date().setHours(0, 0, 0, 0))
                }
            }),
            SessionLog.aggregate([
                { $match: { userId: userId } },
                { $group: { 
                    _id: '$deviceType', 
                    count: { $sum: 1 } 
                }}
            ])
        ]);

        const stats = {
            totalSessions,
            activeSessions,
            todaySessions,
            deviceBreakdown: deviceStats
        };

        log.info({
            userId,
            stats
        }, 'Session statistics retrieved');

        res.status(200).json({
            success: true,
            data: { stats }
        });

    } catch (error: any) {
        log.error({ error: error.message }, 'Error getting session statistics');
        res.status(500).json({
            success: false,
            message: 'Internal server error while retrieving session statistics'
        });
    }
};
