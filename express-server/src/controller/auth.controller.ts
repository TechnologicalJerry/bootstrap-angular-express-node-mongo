import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { SessionLog } from '../models/session-log.model';
import { parseDeviceInfo, generateSessionId } from '../utilitys/device-parser';
import log from '../utilitys/logger';

// Generate JWT tokens
const generateTokens = (userId: string) => {
    const accessToken = jwt.sign(
        { userId },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
        { userId },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' } as jwt.SignOptions
    );

    return { accessToken, refreshToken };
};

// Register new user
export const register = async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, userName, email, password, gender, dob } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { userName }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or username already exists'
            });
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = new User({
            firstName,
            lastName,
            userName,
            email,
            password: hashedPassword,
            gender,
            dob: new Date(dob)
        });

        await newUser.save();

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens((newUser._id as any).toString());

        log.info({
            userId: newUser._id,
            email: newUser.email,
            userName: newUser.userName
        }, 'User registered successfully');

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: newUser._id,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    userName: newUser.userName,
                    email: newUser.email,
                    gender: newUser.gender,
                    dob: newUser.dob
                },
                accessToken,
                refreshToken
            }
        });

    } catch (error: any) {
        log.error({ error: error.message }, 'Registration error');
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration'
        });
    }
};

// Login user
export const login = async (req: Request, res: Response) => {
    try {
        const { userId, password } = req.body;

        // Find user by email or username
        const user = await User.findOne({
            $or: [
                { email: userId },
                { userName: userId }
            ]
        });
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email/username or password'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email/username or password'
            });
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens((user._id as any).toString());

        // Parse device information
        const deviceInfo = parseDeviceInfo(req);
        const sessionId = generateSessionId();

        // Create session log
        const sessionLog = new SessionLog({
            userId: user._id,
            sessionId,
            loginTime: new Date(),
            ipAddress: deviceInfo.ipAddress,
            userAgent: deviceInfo.userAgent,
            deviceType: deviceInfo.deviceType,
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            isActive: true,
            lastActivity: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });

        await sessionLog.save();

        log.info({
            userId: user._id,
            email: user.email,
            sessionId,
            deviceType: deviceInfo.deviceType,
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            ipAddress: deviceInfo.ipAddress
        }, 'User logged in successfully');

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    userName: user.userName,
                    email: user.email,
                    gender: user.gender,
                    dob: user.dob
                },
                accessToken,
                refreshToken,
                sessionId
            }
        });

    } catch (error: any) {
        log.error({ error: error.message }, 'Login error');
        res.status(500).json({
            success: false,
            message: 'Internal server error during login'
        });
    }
};

// Logout user
export const logout = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.body;
        
        if (sessionId) {
            // Find and deactivate the specific session
            const session = await SessionLog.findOne({ 
                sessionId, 
                isActive: true 
            });
            
            if (session) {
                await session.logout();
                log.info({
                    sessionId,
                    userId: session.userId
                }, 'User session logged out');
            }
        } else if (req.user) {
            // If no sessionId provided but user is authenticated, deactivate all user sessions
            await SessionLog.deactivateAllUserSessions(req.user._id);
            log.info({
                userId: req.user._id
            }, 'All user sessions logged out');
        }
        
        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });

    } catch (error: any) {
        log.error({ error: error.message }, 'Logout error');
        res.status(500).json({
            success: false,
            message: 'Internal server error during logout'
        });
    }
};

// Refresh token
export const refreshToken = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token is required'
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'fallback-secret') as any;
        
        // Find user
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

        // Generate new tokens
        const { accessToken, refreshToken: newRefreshToken } = generateTokens((user._id as any).toString());

        log.info({
            userId: user._id
        }, 'Token refreshed successfully');

        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken,
                refreshToken: newRefreshToken
            }
        });

    } catch (error: any) {
        log.error({ error: error.message }, 'Token refresh error');
        res.status(401).json({
            success: false,
            message: 'Invalid refresh token'
        });
    }
};

// Forgot password
export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal if email exists or not
            return res.status(200).json({
                success: true,
                message: 'If the email exists, a password reset link has been sent'
            });
        }

        // In a real application, you would:
        // 1. Generate a reset token
        // 2. Save it to the database with expiration
        // 3. Send an email with the reset link

        log.info({
            userId: user._id,
            email: user.email
        }, 'Password reset requested');

        res.status(200).json({
            success: true,
            message: 'If the email exists, a password reset link has been sent'
        });

    } catch (error: any) {
        log.error({ error: error.message }, 'Forgot password error');
        res.status(500).json({
            success: false,
            message: 'Internal server error during password reset request'
        });
    }
};

// Reset password
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Token and new password are required'
            });
        }

        // In a real application, you would:
        // 1. Verify the reset token
        // 2. Check if it's expired
        // 3. Update the user's password

        log.info({}, 'Password reset completed');

        res.status(200).json({
            success: true,
            message: 'Password has been reset successfully'
        });

    } catch (error: any) {
        log.error({ error: error.message }, 'Password reset error');
        res.status(500).json({
            success: false,
            message: 'Internal server error during password reset'
        });
    }
};
