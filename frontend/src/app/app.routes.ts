import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.LoginPage),
  },
  {
    path: '',
    loadComponent: () => import('./layout/layout').then((m) => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.DashboardPage) },
      { path: 'modules', loadComponent: () => import('./pages/modules/modules').then((m) => m.ModulesPage) },
      { path: 'progress', loadComponent: () => import('./pages/progress/progress').then((m) => m.ProgressPage) },
      { path: 'admin', loadComponent: () => import('./pages/admin/admin').then((m) => m.AdminPage), canActivate: [adminGuard] },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];
