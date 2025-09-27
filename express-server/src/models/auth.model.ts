import mongoose, { Schema, Document } from 'mongoose';

// Refresh Token Interface
export interface IRefreshToken extends Document {
    userId: mongoose.Types.ObjectId;
    token: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

// Password Reset Token Interface
export interface IPasswordResetToken extends Document {
    userId: mongoose.Types.ObjectId;
    token: string;
    expiresAt: Date;
    used: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// User Session Interface
export interface IUserSession extends Document {
    userId: mongoose.Types.ObjectId;
    refreshToken: string;
    deviceInfo?: {
        userAgent?: string;
        ipAddress?: string;
        deviceType?: string;
    };
    isActive: boolean;
    lastActivity: Date;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

// Refresh Token Schema
const RefreshTokenSchema: Schema = new Schema<IRefreshToken>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        token: {
            type: String,
            required: true,
            unique: true,
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

// Password Reset Token Schema
const PasswordResetTokenSchema: Schema = new Schema<IPasswordResetToken>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        token: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        expiresAt: {
            type: Date,
            required: true,
            index: { expireAfterSeconds: 0 } // TTL index
        },
        used: {
            type: Boolean,
            default: false,
            index: true
        }
    },
    {
        timestamps: true
    }
);

// User Session Schema
const UserSessionSchema: Schema = new Schema<IUserSession>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        refreshToken: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        deviceInfo: {
            userAgent: {
                type: String,
                trim: true
            },
            ipAddress: {
                type: String,
                trim: true
            },
            deviceType: {
                type: String,
                enum: ['mobile', 'tablet', 'desktop', 'unknown'],
                default: 'unknown'
            }
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

// Indexes for better performance
RefreshTokenSchema.index({ userId: 1, expiresAt: 1 });
PasswordResetTokenSchema.index({ userId: 1, used: 1, expiresAt: 1 });
UserSessionSchema.index({ userId: 1, isActive: 1, expiresAt: 1 });

// Static methods for RefreshToken
RefreshTokenSchema.statics.findByToken = function(token: string) {
    return this.findOne({ token, expiresAt: { $gt: new Date() } });
};

RefreshTokenSchema.statics.deleteByUserId = function(userId: string) {
    return this.deleteMany({ userId });
};

// Static methods for PasswordResetToken
PasswordResetTokenSchema.statics.findByToken = function(token: string) {
    return this.findOne({ token, used: false, expiresAt: { $gt: new Date() } });
};

PasswordResetTokenSchema.statics.markAsUsed = function(token: string) {
    return this.findOneAndUpdate(
        { token },
        { used: true },
        { new: true }
    );
};

// Static methods for UserSession
UserSessionSchema.statics.findByRefreshToken = function(refreshToken: string) {
    return this.findOne({ 
        refreshToken, 
        isActive: true, 
        expiresAt: { $gt: new Date() } 
    });
};

UserSessionSchema.statics.deactivateByUserId = function(userId: string) {
    return this.updateMany(
        { userId, isActive: true },
        { isActive: false }
    );
};

UserSessionSchema.statics.updateLastActivity = function(sessionId: string) {
    return this.findByIdAndUpdate(
        sessionId,
        { lastActivity: new Date() },
        { new: true }
    );
};

// Instance methods
UserSessionSchema.methods.deactivate = function() {
    this.isActive = false;
    return this.save();
};

// Export models
export const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
export const PasswordResetToken = mongoose.model<IPasswordResetToken>('PasswordResetToken', PasswordResetTokenSchema);
export const UserSession = mongoose.model<IUserSession>('UserSession', UserSessionSchema);
