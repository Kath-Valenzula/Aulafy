import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then((m) => m.LoginComponent)
  },
  {
    path: 'app',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.DashboardComponent)
      },
      {
        path: 'feed',
        loadComponent: () => import('./features/feed/feed').then((m) => m.FeedComponent)
      },
      {
        path: 'calendar',
        loadComponent: () => import('./features/calendar/calendar').then((m) => m.CalendarComponent)
      },
      {
        path: 'academic',
        loadComponent: () => import('./features/academic/academic').then((m) => m.AcademicComponent)
      },
      {
        path: 'attendance',
        loadComponent: () => import('./features/attendance/attendance').then((m) => m.AttendanceComponent)
      },
      {
        path: 'users',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'COLEGIO'] },
        loadComponent: () => import('./features/users/users').then((m) => m.UsersComponent)
      },
      {
        path: 'courses',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'COLEGIO'] },
        loadComponent: () => import('./features/courses/courses').then((m) => m.CoursesComponent)
      },
      {
        path: 'notifications',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'COLEGIO', 'PROFESOR'] },
        loadComponent: () => import('./features/notifications/notifications').then((m) => m.NotificationsComponent)
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
    ]
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' }
];
