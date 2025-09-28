import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  currentUser: any = null;

  constructor(
    private authService: Auth,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    // Initialize sidebar toggle functionality
    this.initializeSidebarToggle();
  }

  logout(): void {
    this.authService.logout();
  }

  private initializeSidebarToggle(): void {
    // This will be handled by JavaScript for sidebar toggle
    // In a real app, you might want to use Angular animations
  }
}
