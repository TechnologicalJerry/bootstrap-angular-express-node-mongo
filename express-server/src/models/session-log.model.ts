import mongoose, { Schema, Document } from 'mongoose';

export interface ISessionLog extends Document {
    userId: mongoose.Types.ObjectId;
    sessionId: string;
    loginTime: Date;
    logoutTime?: Date;
    ipAddress?: string;
    userAgent?: string;
    deviceType?: string;
    browser?: string;
    os?: string;
    location?: {
        country?: string;
        city?: string;
        region?: string;
    };
    isActive: boolean;
    lastActivity: Date;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const SessionLogSchema: Schema = new Schema<ISessionLog>(
    {
        userId: { 
            type: Schema.Types.ObjectId, 
            ref: 'Users', 
            required: true,
            index: true
        },
        sessionId: { 
            type: String, 
            required: true, 
            unique: true,
            index: true
        },
        loginTime: { 
            type: Date, 
            required: true,
            default: Date.now
        },
        logoutTime: { 
            type: Date,
            default: null
        },
        ipAddress: { 
            type: String,
            trim: true
        },
        userAgent: { 
            type: String,
            trim: true
        },
        deviceType: { 
            type: String,
            enum: ['desktop', 'mobile', 'tablet', 'unknown'],
            default: 'unknown'
        },
        browser: { 
            type: String,
            trim: true
        },
        os: { 
            type: String,
            trim: true
        },
        location: {
            country: { type: String, trim: true },
            city: { type: String, trim: true },
            region: { type: String, trim: true }
        },
        isActive: { 
            type: Boolean, 
            default: true,
            index: true
        },
        lastActivity: { 
            type: Date, 
            default: Date.now,
            index: true
        },
        expiresAt: { 
            type: Date, 
            required: true,
            index: { expireAfterSeconds: 0 } // TTL index
        }
    },
    {
        timestamps: true
    }
);

// Indexes for better query performance
SessionLogSchema.index({ userId: 1, isActive: 1 });
SessionLogSchema.index({ sessionId: 1, isActive: 1 });
SessionLogSchema.index({ loginTime: -1 });
SessionLogSchema.index({ lastActivity: -1 });

// Static method to find active sessions for a user
SessionLogSchema.statics.findActiveSessions = function(userId: string) {
    return this.find({ 
        userId, 
        isActive: true,
        expiresAt: { $gt: new Date() }
    }).sort({ loginTime: -1 });
};

// Static method to find session by sessionId
SessionLogSchema.statics.findBySessionId = function(sessionId: string) {
    return this.findOne({ sessionId, isActive: true });
};

// Static method to deactivate all sessions for a user
SessionLogSchema.statics.deactivateAllUserSessions = function(userId: string) {
    return this.updateMany(
        { userId, isActive: true },
        { 
            isActive: false, 
            logoutTime: new Date(),
            lastActivity: new Date()
        }
    );
};

// Instance method to update last activity
SessionLogSchema.methods.updateActivity = function() {
    this.lastActivity = new Date();
    return this.save();
};

// Instance method to logout session
SessionLogSchema.methods.logout = function() {
    this.isActive = false;
    this.logoutTime = new Date();
    this.lastActivity = new Date();
    return this.save();
};

export const SessionLog = mongoose.model<ISessionLog>('SessionLogs', SessionLogSchema);
