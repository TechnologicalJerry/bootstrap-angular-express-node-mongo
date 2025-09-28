import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { About } from './features/about/about';
import { Dashboard } from './features/dashboard/dashboard';
import { Login } from './features/auth/login/login';
import { Signup } from './features/auth/signup/signup';
import { Products } from './features/dashboard/components/products/products';
import { Profile } from './features/dashboard/components/profile/profile';
import { Users } from './features/dashboard/components/users/users';
import { NotFound } from './shared/components/not-found/not-found';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  // Main routes
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'about', component: About },
  
  // Auth routes
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  
  // Dashboard routes (protected)
  { 
    path: 'dashboard', 
    component: Dashboard,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      { path: 'products', component: Products },
      { path: 'profile', component: Profile },
      { path: 'users', component: Users }
    ]
  },
  
  // Wildcard route for 404
  { path: '**', component: NotFound }
];
