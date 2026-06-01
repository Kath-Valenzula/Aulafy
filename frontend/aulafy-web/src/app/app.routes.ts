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
        path: 'home',
        loadComponent: () => import('./features/home-redirect/home-redirect').then((m) => m.HomeRedirectComponent)
      },
      {
        path: 'dashboard',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'COLEGIO', 'PROFESOR'] },
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
        path: 'guardian',
        canActivate: [roleGuard],
        data: { roles: ['APODERADO', 'ESTUDIANTE'] },
        loadComponent: () => import('./features/guardian/guardian').then((m) => m.GuardianComponent)
      },
      {
        path: 'users',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'COLEGIO', 'PROFESOR'] },
        loadComponent: () => import('./features/users/users').then((m) => m.UsersComponent)
      },
      {
        path: 'courses',
        loadComponent: () => import('./features/courses/courses').then((m) => m.CoursesComponent)
      },
      {
        path: 'notifications',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'COLEGIO', 'PROFESOR'] },
        loadComponent: () => import('./features/notifications/notifications').then((m) => m.NotificationsComponent)
      },
      {
        path: 'annotations',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'COLEGIO', 'PROFESOR'] },
        loadComponent: () => import('./features/annotations/annotations').then((m) => m.AnnotationsComponent)
      },
      {
        path: 'risk',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'COLEGIO', 'PROFESOR'] },
        loadComponent: () => import('./features/risk/risk').then((m) => m.RiskComponent)
      },
      {
        path: 'messages',
        canActivate: [roleGuard],
        data: { roles: ['APODERADO', 'ESTUDIANTE'] },
        loadComponent: () => import('./features/messages/messages').then((m) => m.MessagesComponent)
      },
      {
        path: 'chat-profesor',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'COLEGIO', 'PROFESOR', 'APODERADO', 'ESTUDIANTE'] },
        loadComponent: () => import('./features/chat/chat').then((m) => m.ChatComponent)
      },
      {
        path: 'profile',
        canActivate: [roleGuard],
        data: { roles: ['APODERADO', 'ESTUDIANTE'] },
        loadComponent: () => import('./features/profile/profile').then((m) => m.ProfileComponent)
      },
      { path: '', pathMatch: 'full', redirectTo: 'home' }
    ]
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' }
];
