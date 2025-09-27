import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/user.model';
import log from '../utilitys/logger';

// Get all users with pagination and search
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        // Build search query
        const searchQuery: any = {};
        if (search) {
            searchQuery.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { userName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort object
        const sortObj: any = {};
        sortObj[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

        // Calculate pagination
        const skip = (Number(page) - 1) * Number(limit);

        // Execute query
        const users = await User.find(searchQuery)
            .select('-password')
            .sort(sortObj)
            .skip(skip)
            .limit(Number(limit));

        const totalUsers = await User.countDocuments(searchQuery);
        const totalPages = Math.ceil(totalUsers / Number(limit));

        log.info({
            totalUsers,
            page: Number(page),
            limit: Number(limit),
            search
        }, 'Users retrieved successfully');

        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: {
                users,
                pagination: {
                    currentPage: Number(page),
                    totalPages,
                    totalUsers,
                    hasNextPage: Number(page) < totalPages,
                    hasPrevPage: Number(page) > 1
                }
            }
        });

    } catch (error: any) {
        log.error({ error: error.message }, 'Error retrieving users');
        res.status(500).json({
            success: false,
            message: 'Internal server error while retrieving users'
        });
    }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        log.info({
            userId: user._id,
            email: user.email
        }, 'User retrieved successfully');

        res.status(200).json({
            success: true,
            message: 'User retrieved successfully',
            data: { user }
        });

    } catch (error: any) {
        log.error({ error: error.message }, 'Error retrieving user');
        res.status(500).json({
            success: false,
            message: 'Internal server error while retrieving user'
        });
    }
};

// Create new user
export const createUser = async (req: Request, res: Response) => {
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

        // Remove password from response
        const { password: _, ...userResponse } = newUser.toObject();

        log.info({
            userId: newUser._id,
            email: newUser.email,
            userName: newUser.userName
        }, 'User created successfully');

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: { user: userResponse }
        });

    } catch (error: any) {
        log.error({ error: error.message }, 'Error creating user');
        res.status(500).json({
            success: false,
            message: 'Internal server error while creating user'
        });
    }
};

// Update user
export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Check if user exists
        const existingUser = await User.findById(id);
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check for email/username conflicts if they're being updated
        if (updateData.email || updateData.userName) {
            const conflictQuery: any = { _id: { $ne: id } };
            if (updateData.email) conflictQuery.email = updateData.email;
            if (updateData.userName) conflictQuery.userName = updateData.userName;

            const conflictingUser = await User.findOne(conflictQuery);
            if (conflictingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email or username already exists'
                });
            }
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        log.info({
            userId: id,
            updatedFields: Object.keys(updateData)
        }, 'User updated successfully');

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: { user: updatedUser }
        });

    } catch (error: any) {
        log.error({ error: error.message }, 'Error updating user');
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating user'
        });
    }
};

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await User.findByIdAndDelete(id);

        log.info({
            userId: id,
            email: user.email
        }, 'User deleted successfully');

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error: any) {
        log.error({ error: error.message }, 'Error deleting user');
        res.status(500).json({
            success: false,
            message: 'Internal server error while deleting user'
        });
    }
};

// Change user password
export const changeUserPassword = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        // Check if user exists
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Hash new password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        await User.findByIdAndUpdate(id, { password: hashedPassword });

        log.info({
            userId: id,
            email: user.email
        }, 'User password changed successfully');

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error: any) {
        log.error({ error: error.message }, 'Error changing user password');
        res.status(500).json({
            success: false,
            message: 'Internal server error while changing password'
        });
    }
};

// Get user profile
export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        log.info({
            userId: user._id,
            email: user.email
        }, 'User profile retrieved successfully');

        res.status(200).json({
            success: true,
            message: 'User profile retrieved successfully',
            data: { user }
        });

    } catch (error: any) {
        log.error({ error: error.message }, 'Error retrieving user profile');
        res.status(500).json({
            success: false,
            message: 'Internal server error while retrieving user profile'
        });
    }
};
