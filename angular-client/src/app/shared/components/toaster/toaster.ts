import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastMessage, Toast } from '../../../core/services/toast';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toaster',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toaster.html',
  styleUrl: './toaster.scss'
})
export class Toaster implements OnInit, OnDestroy {
  toasts: ToastMessage[] = [];
  private subscription!: Subscription;

  constructor(private toastService: Toast) {}

  ngOnInit(): void {
    this.subscription = this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  removeToast(id: string): void {
    this.toastService.removeToast(id);
  }

  trackByToastId(index: number, toast: ToastMessage): string {
    return toast.id;
  }

  getIconClass(toast: ToastMessage): string {
    switch (toast.type) {
      case 'success':
        return 'bi-check-circle-fill';
      case 'error':
        return 'bi-exclamation-triangle-fill';
      case 'warning':
        return 'bi-exclamation-triangle-fill';
      case 'info':
        return 'bi-info-circle-fill';
      default:
        return 'bi-info-circle-fill';
    }
  }

  getToastClass(toast: ToastMessage): string {
    const baseClass = 'toast align-items-center';
    const typeClass = `toast-${toast.type}`;
    return `${baseClass} ${typeClass}`;
  }

  getHeaderClass(toast: ToastMessage): string {
    return `toast-header bg-${toast.type === 'error' ? 'danger' : toast.type === 'warning' ? 'warning' : toast.type === 'success' ? 'success' : 'info'} text-white`;
  }

  // Auto-hide logic for individual toasts
  handleToastAutoHide(toast: ToastMessage): void {
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        this.removeToast(toast.id);
      }, toast.duration);
    }
  }
}
