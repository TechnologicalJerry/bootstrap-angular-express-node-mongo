import { z as zodValidation } from "zod";

// Get User by ID Schema
export const getUserByIdSchema = zodValidation.object({
    params: zodValidation.object({
        id: zodValidation.string()
            .regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format")
    })
});

// Get All Users Schema
export const getAllUsersSchema = zodValidation.object({
    query: zodValidation.object({
        page: zodValidation.string()
            .regex(/^\d+$/, "Page must be a number")
            .optional()
            .default("1")
            .transform(Number)
            .refine((val) => val > 0, "Page must be greater than 0"),
        limit: zodValidation.string()
            .regex(/^\d+$/, "Limit must be a number")
            .optional()
            .default("10")
            .transform(Number)
            .refine((val) => val > 0 && val <= 100, "Limit must be between 1 and 100"),
        search: zodValidation.string()
            .min(1, "Search term must be at least 1 character")
            .max(100, "Search term must be less than 100 characters")
            .trim()
            .optional(),
        sortBy: zodValidation.enum(['firstName', 'lastName', 'userName', 'email', 'createdAt'])
            .optional()
            .default('createdAt'),
        sortOrder: zodValidation.enum(['asc', 'desc'])
            .optional()
            .default('desc')
    })
});

// Update User Schema
export const updateUserSchema = zodValidation.object({
    params: zodValidation.object({
        id: zodValidation.string()
            .regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format")
    }),
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

// Delete User Schema
export const deleteUserSchema = zodValidation.object({
    params: zodValidation.object({
        id: zodValidation.string()
            .regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format")
    })
});

// Change User Password Schema
export const changeUserPasswordSchema = zodValidation.object({
    params: zodValidation.object({
        id: zodValidation.string()
            .regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format")
    }),
    body: zodValidation.object({
        newPassword: zodValidation.string()
            .min(8, "Password must be at least 8 characters")
            .max(128, "Password must be less than 128 characters")
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
                "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
    })
});

// Get User Profile Schema
export const getUserProfileSchema = zodValidation.object({
    params: zodValidation.object({
        id: zodValidation.string()
            .regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format")
    })
});

// Type exports for TypeScript
export type GetUserByIdInput = zodValidation.infer<typeof getUserByIdSchema>['params'];
export type GetAllUsersInput = zodValidation.infer<typeof getAllUsersSchema>['query'];
export type UpdateUserInput = zodValidation.infer<typeof updateUserSchema>['body'];
export type UpdateUserParams = zodValidation.infer<typeof updateUserSchema>['params'];
export type DeleteUserInput = zodValidation.infer<typeof deleteUserSchema>['params'];
export type ChangeUserPasswordInput = zodValidation.infer<typeof changeUserPasswordSchema>['body'];
export type ChangeUserPasswordParams = zodValidation.infer<typeof changeUserPasswordSchema>['params'];
export type GetUserProfileInput = zodValidation.infer<typeof getUserProfileSchema>['params'];