import { Request, Response, NextFunction } from 'express';
import { SessionLog } from '../models/session-log.model';
import log from '../utilitys/logger';

// Middleware to track session activity
export const trackSessionActivity = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Only track if user is authenticated and has a sessionId
        if (req.user && req.body.sessionId) {
            const session = await SessionLog.findBySessionId(req.body.sessionId);
            
            if (session && session.isActive && session.expiresAt > new Date()) {
                // Update last activity
                await session.updateActivity();
                
                log.debug({
                    sessionId: req.body.sessionId,
                    userId: req.user._id,
                    endpoint: req.path,
                    method: req.method
                }, 'Session activity tracked');
            }
        }
        
        next();
    } catch (error) {
        // Don't fail the request if session tracking fails
        log.error({ error }, 'Error tracking session activity');
        next();
    }
};

// Middleware to validate session on protected routes
export const validateSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { sessionId } = req.body;
        
        if (!sessionId) {
            return next(); // Continue without session validation
        }
        
        const session = await SessionLog.findBySessionId(sessionId);
        
        if (!session) {
            return res.status(401).json({
                success: false,
                message: 'Invalid session'
            });
        }
        
        if (!session.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Session has been terminated'
            });
        }
        
        if (session.expiresAt <= new Date()) {
            // Auto-logout expired session
            await session.logout();
            return res.status(401).json({
                success: false,
                message: 'Session has expired'
            });
        }
        
        // Update activity
        await session.updateActivity();
        
        next();
    } catch (error) {
        log.error({ error }, 'Error validating session');
        res.status(500).json({
            success: false,
            message: 'Internal server error during session validation'
        });
    }
};
