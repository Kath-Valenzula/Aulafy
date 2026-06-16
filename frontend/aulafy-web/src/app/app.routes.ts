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
        canActivate: [roleGuard],
        data: { roles: ['COLEGIO', 'PROFESOR', 'APODERADO', 'ESTUDIANTE'] },
        loadComponent: () => import('./features/feed/feed').then((m) => m.FeedComponent)
      },
      {
        path: 'calendar',
        canActivate: [roleGuard],
        data: { roles: ['COLEGIO', 'PROFESOR', 'APODERADO', 'ESTUDIANTE'] },
        loadComponent: () => import('./features/calendar/calendar').then((m) => m.CalendarComponent)
      },
      {
        path: 'academic',
        canActivate: [roleGuard],
        data: { roles: ['PROFESOR', 'APODERADO', 'ESTUDIANTE'] },
        loadComponent: () => import('./features/academic/academic').then((m) => m.AcademicComponent)
      },
      {
        path: 'attendance',
        canActivate: [roleGuard],
        data: { roles: ['PROFESOR', 'APODERADO', 'ESTUDIANTE'] },
        loadComponent: () => import('./features/attendance/attendance').then((m) => m.AttendanceComponent)
      },
      {
        path: 'guardian/students',
        canActivate: [roleGuard],
        data: { roles: ['APODERADO'] },
        loadComponent: () => import('./features/guardian/guardian').then((m) => m.GuardianComponent)
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
        data: {
          roles: ['ADMIN'],
          title: 'Gestion de usuarios',
          description: 'Administra cuentas y roles principales del sistema.',
          actionLabel: 'Crear usuario'
        },
        loadComponent: () => import('./features/users/users').then((m) => m.UsersComponent)
      },
      {
        path: 'users/students',
        canActivate: [roleGuard],
        data: {
          roles: ['ADMIN'],
          title: 'Estudiantes',
          description: 'Consulta cuentas de estudiantes registradas en la plataforma.',
          actionLabel: 'Crear estudiante',
          roleFilter: ['ESTUDIANTE']
        },
        loadComponent: () => import('./features/users/users').then((m) => m.UsersComponent)
      },
      {
        path: 'users/teachers',
        canActivate: [roleGuard],
        data: {
          roles: ['ADMIN'],
          title: 'Profesores',
          description: 'Consulta cuentas docentes disponibles para asignacion academica.',
          actionLabel: 'Crear profesor',
          roleFilter: ['PROFESOR']
        },
        loadComponent: () => import('./features/users/users').then((m) => m.UsersComponent)
      },
      {
        path: 'users/guardians',
        canActivate: [roleGuard],
        data: {
          roles: ['ADMIN'],
          title: 'Apoderados',
          description: 'Consulta cuentas de apoderados vinculables a estudiantes.',
          actionLabel: 'Crear apoderado',
          roleFilter: ['APODERADO']
        },
        loadComponent: () => import('./features/users/users').then((m) => m.UsersComponent)
      },
      {
        path: 'users/academic',
        canActivate: [roleGuard],
        data: {
          roles: ['COLEGIO'],
          title: 'Usuarios academicos',
          description: 'Gestion institucional de profesores, estudiantes y apoderados.',
          actionLabel: 'Crear usuario academico',
          roleFilter: ['PROFESOR', 'APODERADO', 'ESTUDIANTE']
        },
        loadComponent: () => import('./features/users/users').then((m) => m.UsersComponent)
      },
      {
        path: 'courses',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'COLEGIO', 'PROFESOR'] },
        loadComponent: () => import('./features/courses/courses').then((m) => m.CoursesComponent)
      },
      {
        path: 'subjects',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('./features/subjects/subjects').then((m) => m.SubjectsComponent)
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
        data: { roles: ['PROFESOR'] },
        loadComponent: () => import('./features/annotations/annotations').then((m) => m.AnnotationsComponent)
      },
      {
        path: 'risk',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'COLEGIO'] },
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
        data: { roles: ['ADMIN', 'COLEGIO', 'PROFESOR', 'APODERADO', 'ESTUDIANTE'], experimental: true },
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
