import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { Api, ApiResponse } from './api';

export interface LoginRequest {
  email: string;
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
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private readonly TOKEN_KEY = 'authToken';
  private readonly USER_KEY = 'authUser';

  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private Api: Api,
    private router: Router
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
          if (response.success && response.token && response.user) {
            this.setAuthData(response.token, response.user);
            this.currentUserSubject.next(response.user);
            this.isAuthenticatedSubject.next(true);
          }
        })
      );
  }

  register(userData: RegisterRequest): Observable<ApiResponse> {
    console.log('userData in auth service', userData);
    return this.Api.post<ApiResponse>('/auth/register', userData);
  }

  logout(): void {
    this.clearAuthData();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
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

  private setAuthData(token: string, user: AuthUser): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
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
    }
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
