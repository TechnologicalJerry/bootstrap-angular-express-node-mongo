import { SessionLog } from '../models/session-log.model';
import log from './logger';

// Clean up expired sessions
export const cleanupExpiredSessions = async () => {
    try {
        const now = new Date();
        
        // Find and deactivate expired sessions
        const result = await SessionLog.updateMany(
            {
                isActive: true,
                expiresAt: { $lte: now }
            },
            {
                isActive: false,
                logoutTime: now,
                lastActivity: now
            }
        );

        if (result.modifiedCount > 0) {
            log.info({
                expiredSessions: result.modifiedCount
            }, 'Expired sessions cleaned up');
        }

        return result.modifiedCount;
    } catch (error) {
        log.error({ error }, 'Error cleaning up expired sessions');
        throw error;
    }
};

// Clean up old inactive sessions (older than 30 days)
export const cleanupOldSessions = async () => {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        const result = await SessionLog.deleteMany({
            isActive: false,
            logoutTime: { $lt: thirtyDaysAgo }
        });

        if (result.deletedCount > 0) {
            log.info({
                deletedSessions: result.deletedCount
            }, 'Old inactive sessions cleaned up');
        }

        return result.deletedCount;
    } catch (error) {
        log.error({ error }, 'Error cleaning up old sessions');
        throw error;
    }
};

// Run cleanup jobs
export const runSessionCleanup = async () => {
    try {
        log.info({}, 'Starting session cleanup jobs');
        
        const [expiredCount, oldCount] = await Promise.all([
            cleanupExpiredSessions(),
            cleanupOldSessions()
        ]);

        log.info({
            expiredSessions: expiredCount,
            oldSessions: oldCount
        }, 'Session cleanup completed');

        return {
            expiredSessions: expiredCount,
            oldSessions: oldCount
        };
    } catch (error) {
        log.error({ error }, 'Error running session cleanup');
        throw error;
    }
};
