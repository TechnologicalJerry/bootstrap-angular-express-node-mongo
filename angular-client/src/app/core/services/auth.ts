import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { Api, ApiResponse } from './api';
import { Toast } from './toast';

export interface LoginRequest {
  userId: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  gender: string;
  dob: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      userName: string;
      email: string;
      gender: string;
      dob: string;
    };
    accessToken: string;
    refreshToken: string;
    sessionId: string;
  };
}

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  gender: string;
  dob: string;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private readonly TOKEN_KEY = 'authToken';
  private readonly USER_KEY = 'authUser';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';

  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private Api: Api,
    private router: Router,
    private toastService: Toast
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    // Check if we're in browser environment
    if (typeof window !== 'undefined') {
      const token = this.getToken();
      const user = this.getStoredUser();

      if (token && user) {
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      }
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.Api.post<LoginResponse>('/auth/login', credentials)
      .pipe(
        tap(response => {
          if (response.success && response.data?.accessToken && response.data?.user) {
            this.setAuthData(response.data.accessToken, response.data.user, response.data.refreshToken);
            this.currentUserSubject.next(response.data.user);
            this.isAuthenticatedSubject.next(true);
            this.toastService.success('Login Successful', `Welcome back, ${response.data.user.firstName}!`);
          } else {
            this.toastService.error('Login Failed', response.message || 'Invalid credentials');
          }
        })
      );
  }

  register(userData: RegisterRequest): Observable<ApiResponse> {
    console.log('userData in auth service', userData);
    return this.Api.post<ApiResponse>('/auth/register', userData)
      .pipe(
        tap(response => {
          if (response.success) {
            this.toastService.success('Registration Successful', 'Account created successfully! Please login to continue.');
          } else {
            this.toastService.error('Registration Failed', response.message || 'Registration failed');
          }
        })
      );
  }

  logout(): void {
    // Get refresh token before clearing data
    const refreshToken = this.getRefreshToken();
    
    if (refreshToken) {
      // Call logout API
      this.Api.post('/auth/logout', { refreshToken })
        .subscribe({
          next: (response) => {
            console.log('Logout successful:', response);
            this.toastService.success('Logout Successful', 'You have been logged out successfully');
          },
          error: (error) => {
            console.error('Logout API error:', error);
            this.toastService.warning('Logout Warning', 'Logged out locally, but server logout failed');
          },
          complete: () => {
            // Clear local data regardless of API response
            this.clearAuthData();
            this.currentUserSubject.next(null);
            this.isAuthenticatedSubject.next(false);
            this.router.navigate(['/login']);
          }
        });
    } else {
      // No refresh token, just clear local data
      this.clearAuthData();
      this.currentUserSubject.next(null);
      this.isAuthenticatedSubject.next(false);
      this.toastService.info('Logged Out', 'You have been logged out');
      this.router.navigate(['/login']);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  private setAuthData(token: string, user: AuthUser, refreshToken?: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      if (refreshToken) {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
      }
    }
  }

  private getStoredUser(): AuthUser | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  private clearAuthData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }
  }

  private getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }
    return null;
  }

  // Additional auth methods
  refreshToken(): Observable<ApiResponse<{ token: string }>> {
    return this.Api.post<ApiResponse<{ token: string }>>('/auth/refresh', {});
  }

  changePassword(currentPassword: string, newPassword: string): Observable<ApiResponse> {
    return this.Api.post<ApiResponse>('/auth/change-password', {
      currentPassword,
      newPassword
    });
  }

  forgotPassword(email: string): Observable<ApiResponse> {
    return this.Api.post<ApiResponse>('/auth/forgot-password', { email });
  }

  resetPassword(token: string, newPassword: string): Observable<ApiResponse> {
    return this.Api.post<ApiResponse>('/auth/reset-password', {
      token,
      newPassword
    });
  }
}
