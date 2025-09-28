import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  showCloseButton?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class Toast {
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  private toastId = 0;

  constructor() { }

  // Show success toast
  success(title: string, message: string, duration: number = 5000): void {
    this.showToast({
      id: this.generateId(),
      type: 'success',
      title,
      message,
      duration,
      showCloseButton: true
    });
  }

  // Show error toast
  error(title: string, message: string, duration: number = 7000): void {
    this.showToast({
      id: this.generateId(),
      type: 'error',
      title,
      message,
      duration,
      showCloseButton: true
    });
  }

  // Show warning toast
  warning(title: string, message: string, duration: number = 5000): void {
    this.showToast({
      id: this.generateId(),
      type: 'warning',
      title,
      message,
      duration,
      showCloseButton: true
    });
  }

  // Show info toast
  info(title: string, message: string, duration: number = 5000): void {
    this.showToast({
      id: this.generateId(),
      type: 'info',
      title,
      message,
      duration,
      showCloseButton: true
    });
  }

  // Show custom toast
  showToast(toast: ToastMessage): void {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, toast]);

    // Auto remove after duration
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        this.removeToast(toast.id);
      }, toast.duration);
    }
  }

  // Remove specific toast
  removeToast(id: string): void {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter(toast => toast.id !== id));
  }

  // Clear all toasts
  clearAll(): void {
    this.toastsSubject.next([]);
  }

  // Get current toasts
  getToasts(): ToastMessage[] {
    return this.toastsSubject.value;
  }

  private generateId(): string {
    return `toast-${++this.toastId}-${Date.now()}`;
  }
}
