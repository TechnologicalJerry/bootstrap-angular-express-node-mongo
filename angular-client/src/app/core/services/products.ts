import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Api, ApiResponse, PaginatedResponse } from './api';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  stock: number;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  image?: string;
  stock?: number;
  isActive?: boolean;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class Products {
  constructor(private Api: Api) {}

  // Get all products with pagination and filters
  getProducts(filters?: ProductFilters): Observable<PaginatedResponse<Product>> {
    return this.Api.get<PaginatedResponse<Product>>('/products', filters);
  }

  // Get single product by ID
  getProduct(id: string): Observable<ApiResponse<Product>> {
    return this.Api.get<ApiResponse<Product>>(`/products/${id}`);
  }

  // Create new product
  createProduct(product: CreateProductRequest): Observable<ApiResponse<Product>> {
    return this.Api.post<ApiResponse<Product>>('/products', product);
  }

  // Update product
  updateProduct(id: string, product: UpdateProductRequest): Observable<ApiResponse<Product>> {
    return this.Api.put<ApiResponse<Product>>(`/products/${id}`, product);
  }

  // Delete product
  deleteProduct(id: string): Observable<ApiResponse> {
    return this.Api.delete<ApiResponse>(`/products/${id}`);
  }

  // Upload product image
  uploadProductImage(id: string, file: File): Observable<ApiResponse<{ imageUrl: string }>> {
    return this.Api.uploadFile<ApiResponse<{ imageUrl: string }>>(
      `/products/${id}/image`, 
      file
    );
  }

  // Get product categories
  getCategories(): Observable<ApiResponse<string[]>> {
    return this.Api.get<ApiResponse<string[]>>('/products/categories');
  }

  // Search products
  searchProducts(query: string, filters?: Omit<ProductFilters, 'search'>): Observable<PaginatedResponse<Product>> {
    return this.Api.get<PaginatedResponse<Product>>('/products/search', {
      ...filters,
      search: query
    });
  }

  // Get featured products
  getFeaturedProducts(limit: number = 10): Observable<ApiResponse<Product[]>> {
    return this.Api.get<ApiResponse<Product[]>>('/products/featured', { limit });
  }

  // Get products by category
  getProductsByCategory(category: string, filters?: Omit<ProductFilters, 'category'>): Observable<PaginatedResponse<Product>> {
    return this.Api.get<PaginatedResponse<Product>>(`/products/category/${category}`, filters);
  }

  // Update product stock
  updateStock(id: string, stock: number): Observable<ApiResponse<Product>> {
    return this.Api.patch<ApiResponse<Product>>(`/products/${id}/stock`, { stock });
  }

  // Toggle product active status
  toggleProductStatus(id: string): Observable<ApiResponse<Product>> {
    return this.Api.patch<ApiResponse<Product>>(`/products/${id}/toggle-status`, {});
  }
}
