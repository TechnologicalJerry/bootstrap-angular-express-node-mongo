import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Api, ApiResponse, PaginatedResponse } from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  role: string;
  avatar?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: string;
  avatar?: string;
  isActive?: boolean;
}

export interface UserFilters {
  search?: string;
  role?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  createdAt: string;
  lastLoginAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class User {
  constructor(private Api: Api) {}

  // Get all users with pagination and filters
  getUsers(filters?: UserFilters): Observable<PaginatedResponse<User>> {
    return this.Api.get<PaginatedResponse<User>>('/users', filters);
  }

  // Get single user by ID
  getUser(id: string): Observable<ApiResponse<User>> {
    return this.Api.get<ApiResponse<User>>(`/users/${id}`);
  }

  // Get current user profile
  getCurrentUserProfile(): Observable<ApiResponse<UserProfile>> {
    return this.Api.get<ApiResponse<UserProfile>>('/users/profile');
  }

  // Create new user
  createUser(user: CreateUserRequest): Observable<ApiResponse<User>> {
    return this.Api.post<ApiResponse<User>>('/users', user);
  }

  // Update user
  updateUser(id: string, user: UpdateUserRequest): Observable<ApiResponse<User>> {
    return this.Api.put<ApiResponse<User>>(`/users/${id}`, user);
  }

  // Update current user profile
  updateProfile(profile: Partial<UserProfile>): Observable<ApiResponse<UserProfile>> {
    return this.Api.put<ApiResponse<UserProfile>>('/users/profile', profile);
  }

  // Delete user
  deleteUser(id: string): Observable<ApiResponse> {
    return this.Api.delete<ApiResponse>(`/users/${id}`);
  }

  // Upload user avatar
  uploadAvatar(file: File): Observable<ApiResponse<{ avatarUrl: string }>> {
    return this.Api.uploadFile<ApiResponse<{ avatarUrl: string }>>(
      '/users/avatar', 
      file
    );
  }

  // Change user password
  changePassword(passwordData: ChangePasswordRequest): Observable<ApiResponse> {
    return this.Api.post<ApiResponse>('/users/change-password', passwordData);
  }

  // Search users
  searchUsers(query: string, filters?: Omit<UserFilters, 'search'>): Observable<PaginatedResponse<User>> {
    return this.Api.get<PaginatedResponse<User>>('/users/search', {
      ...filters,
      search: query
    });
  }

  // Get users by role
  getUsersByRole(role: string, filters?: Omit<UserFilters, 'role'>): Observable<PaginatedResponse<User>> {
    return this.Api.get<PaginatedResponse<User>>(`/users/role/${role}`, filters);
  }

  // Toggle user active status
  toggleUserStatus(id: string): Observable<ApiResponse<User>> {
    return this.Api.patch<ApiResponse<User>>(`/users/${id}/toggle-status`, {});
  }

  // Get user statistics
  getUserStats(): Observable<ApiResponse<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    usersByRole: { [role: string]: number };
  }>> {
    return this.Api.get<ApiResponse<{
      totalUsers: number;
      activeUsers: number;
      inactiveUsers: number;
      usersByRole: { [role: string]: number };
    }>>('/users/stats');
  }

  // Reset user password (admin only)
  resetUserPassword(id: string): Observable<ApiResponse<{ temporaryPassword: string }>> {
    return this.Api.post<ApiResponse<{ temporaryPassword: string }>>(`/users/${id}/reset-password`, {});
  }
}
