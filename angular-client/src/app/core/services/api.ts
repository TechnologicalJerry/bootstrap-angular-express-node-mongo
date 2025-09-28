import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class Api {
  private readonly BASE_URL = 'http://localhost:5050/api';

  constructor(
    private http: HttpClient
  ) { }

  // GET request
  get<T>(endpoint: string, params?: any): Observable<T> {
    const url = `${this.BASE_URL}${endpoint}`;
    const httpParams = this.buildHttpParams(params);
    const headers = this.getHeaders();

    return this.http.get<T>(url, { headers, params: httpParams })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  // POST request
  post<T>(endpoint: string, data: any): Observable<T> {
    const url = `${this.BASE_URL}${endpoint}`;
    const headers = this.getHeaders();

    return this.http.post<T>(url, data, { headers })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  // PUT request
  put<T>(endpoint: string, data: any): Observable<T> {
    const url = `${this.BASE_URL}${endpoint}`;
    const headers = this.getHeaders();

    return this.http.put<T>(url, data, { headers })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  // PATCH request
  patch<T>(endpoint: string, data: any): Observable<T> {
    const url = `${this.BASE_URL}${endpoint}`;
    const headers = this.getHeaders();

    return this.http.patch<T>(url, data, { headers })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  // DELETE request
  delete<T>(endpoint: string): Observable<T> {
    const url = `${this.BASE_URL}${endpoint}`;
    const headers = this.getHeaders();

    return this.http.delete<T>(url, { headers })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  // Upload file
  uploadFile<T>(endpoint: string, file: File, additionalData?: any): Observable<T> {
    const url = `${this.BASE_URL}${endpoint}`;
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    const headers = this.getHeaders(false); // Don't set Content-Type for FormData

    return this.http.post<T>(url, formData, { headers })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  // Get headers with authentication
  private getHeaders(includeContentType: boolean = true): HttpHeaders {
    let headers = new HttpHeaders();

    if (includeContentType) {
      headers = headers.set('Content-Type', 'application/json');
    }

    const token = this.getToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  // Get token from localStorage
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  // Build HTTP params from object
  private buildHttpParams(params: any): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    return httpParams;
  }

  // Centralized error handling
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.status === 401) {
        // Unauthorized - clear token and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
        }
        errorMessage = 'Session expired. Please login again.';
      } else if (error.status === 403) {
        errorMessage = 'Access denied. You do not have permission to perform this action.';
      } else if (error.status === 404) {
        errorMessage = 'The requested resource was not found.';
      } else if (error.status === 500) {
        errorMessage = 'Internal server error. Please try again later.';
      } else if (error.status === 0) {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Error ${error.status}: ${error.statusText}`;
      }
    }

    console.error('API Error:', error);
    return throwError(() => errorMessage);
  }

  // Helper method to build query string
  buildQueryString(params: any): string {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          queryParams.append(key, params[key].toString());
        }
      });
    }

    return queryParams.toString();
  }
}
