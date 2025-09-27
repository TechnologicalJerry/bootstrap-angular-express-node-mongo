import { z as zodValidation } from "zod";

// User Registration Schema
export const registerSchema = zodValidation.object({
    body: zodValidation.object({
        firstName: zodValidation.string()
            .min(2, "First name must be at least 2 characters")
            .max(50, "First name must be less than 50 characters")
            .trim(),
        lastName: zodValidation.string()
            .min(2, "Last name must be at least 2 characters")
            .max(50, "Last name must be less than 50 characters")
            .trim(),
        userName: zodValidation.string()
            .min(3, "Username must be at least 3 characters")
            .max(30, "Username must be less than 30 characters")
            .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
            .trim(),
        email: zodValidation.string()
            .email("Invalid email format")
            .toLowerCase()
            .trim(),
        password: zodValidation.string()
            .min(8, "Password must be at least 8 characters")
            .max(128, "Password must be less than 128 characters")
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
                "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
        gender: zodValidation.enum(['male', 'female', 'other'], {
            message: "Gender must be male, female, or other"
        }),
        dob: zodValidation.string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be in YYYY-MM-DD format")
            .refine((date) => {
                const birthDate = new Date(date);
                const today = new Date();
                const age = today.getFullYear() - birthDate.getFullYear();
                return age >= 13 && age <= 120;
            }, "You must be between 13 and 120 years old")
    })
});

// User Login Schema
export const loginSchema = zodValidation.object({
    body: zodValidation.object({
        userId: zodValidation.string()
            .min(1, "Email or username is required")
            .trim(),
        password: zodValidation.string()
            .min(1, "Password is required")
    })
});

// Refresh Token Schema
export const refreshTokenSchema = zodValidation.object({
    body: zodValidation.object({
        refreshToken: zodValidation.string()
            .min(1, "Refresh token is required")
    })
});

// Forgot Password Schema
export const forgotPasswordSchema = zodValidation.object({
    body: zodValidation.object({
        email: zodValidation.string()
            .email("Invalid email format")
            .toLowerCase()
            .trim()
    })
});

// Reset Password Schema
export const resetPasswordSchema = zodValidation.object({
    body: zodValidation.object({
        token: zodValidation.string()
            .min(1, "Reset token is required"),
        newPassword: zodValidation.string()
            .min(8, "Password must be at least 8 characters")
            .max(128, "Password must be less than 128 characters")
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
                "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
    })
});

// Change Password Schema
export const changePasswordSchema = zodValidation.object({
    body: zodValidation.object({
        currentPassword: zodValidation.string()
            .min(1, "Current password is required"),
        newPassword: zodValidation.string()
            .min(8, "Password must be at least 8 characters")
            .max(128, "Password must be less than 128 characters")
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
                "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
    })
});

// Update Profile Schema
export const updateProfileSchema = zodValidation.object({
    body: zodValidation.object({
        firstName: zodValidation.string()
            .min(2, "First name must be at least 2 characters")
            .max(50, "First name must be less than 50 characters")
            .trim()
            .optional(),
        lastName: zodValidation.string()
            .min(2, "Last name must be at least 2 characters")
            .max(50, "Last name must be less than 50 characters")
            .trim()
            .optional(),
        userName: zodValidation.string()
            .min(3, "Username must be at least 3 characters")
            .max(30, "Username must be less than 30 characters")
            .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
            .trim()
            .optional(),
        email: zodValidation.string()
            .email("Invalid email format")
            .toLowerCase()
            .trim()
            .optional(),
        gender: zodValidation.enum(['male', 'female', 'other'], {
            message: "Gender must be male, female, or other"
        }).optional(),
        dob: zodValidation.string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be in YYYY-MM-DD format")
            .refine((date) => {
                const birthDate = new Date(date);
                const today = new Date();
                const age = today.getFullYear() - birthDate.getFullYear();
                return age >= 13 && age <= 120;
            }, "You must be between 13 and 120 years old")
            .optional()
    })
});

// Session Management Schema
export const sessionSchema = zodValidation.object({
    params: zodValidation.object({
        sessionId: zodValidation.string()
            .regex(/^[0-9a-fA-F]{24}$/, "Invalid session ID format")
    })
});

// Device Info Schema
export const deviceInfoSchema = zodValidation.object({
    userAgent: zodValidation.string().optional(),
    ipAddress: zodValidation.string().regex(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, "Invalid IP address format").optional(),
    deviceType: zodValidation.enum(['mobile', 'tablet', 'desktop', 'unknown']).optional()
});

// Type exports for TypeScript
export type RegisterInput = zodValidation.infer<typeof registerSchema>['body'];
export type LoginInput = zodValidation.infer<typeof loginSchema>['body'];
export type RefreshTokenInput = zodValidation.infer<typeof refreshTokenSchema>['body'];
export type ForgotPasswordInput = zodValidation.infer<typeof forgotPasswordSchema>['body'];
export type ResetPasswordInput = zodValidation.infer<typeof resetPasswordSchema>['body'];
export type ChangePasswordInput = zodValidation.infer<typeof changePasswordSchema>['body'];
export type UpdateProfileInput = zodValidation.infer<typeof updateProfileSchema>['body'];
export type SessionParams = zodValidation.infer<typeof sessionSchema>['params'];
export type DeviceInfo = zodValidation.infer<typeof deviceInfoSchema>;
