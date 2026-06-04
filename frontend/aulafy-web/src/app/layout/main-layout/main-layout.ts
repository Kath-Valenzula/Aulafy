import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { RoleName } from '../../shared/models/aulafy.models';
import { AuthService } from '../../core/auth/auth.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles: RoleName[];
  mobile?: boolean;
}

@Component({
  selector: 'app-main-layout',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="bg-background text-on-background min-h-screen font-inter" *ngIf="!isFamiliesExperience(); else familiesLayout">
      <nav class="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant py-6 pr-4 z-40">
        <div class="px-6 mb-8 flex items-center gap-4">
          <div class="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold">A</div>
          <div>
            <h2 class="font-semibold text-primary">Aulafy Admin</h2>
            <p class="text-xs text-on-surface-variant">Gestión Académica</p>
          </div>
        </div>
        <div class="flex flex-col gap-1 flex-1">
          <a
            *ngFor="let item of backofficeNavItems"
            [routerLink]="item.path"
            routerLinkActive="bg-secondary-container text-on-secondary-container font-bold"
            class="flex items-center gap-3 px-6 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-r-full transition-all duration-200"
          >
            <span class="material-symbols-outlined">{{ item.icon }}</span>
            {{ item.label }}
          </a>
        </div>
      </nav>

      <main class="md:ml-64 p-4 md:p-6">
        <header class="mb-4 flex justify-between items-center bg-surface border border-outline-variant rounded-xl p-3">
          <div>
            <strong>{{ auth.currentUser?.fullName }}</strong>
            <p class="text-xs text-on-surface-variant">{{ auth.currentUser?.role }}</p>
          </div>
          <button class="text-sm text-primary hover:text-primary-container" (click)="logout()">Salir</button>
        </header>
        <router-outlet />
      </main>
    </div>

    <ng-template #familiesLayout>
      <div class="bg-background text-on-background min-h-screen font-inter">
        <header class="fixed top-0 left-0 right-0 z-40 bg-surface border-b border-outline-variant flex justify-between items-center px-4 py-3">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-sm font-bold">A</div>
            <h1 class="font-semibold text-primary">Aulafy</h1>
          </div>
          <button class="text-on-surface-variant">
            <span class="material-symbols-outlined">notifications</span>
          </button>
        </header>

        <main class="pt-20 px-4 pb-24 max-w-md mx-auto">
          <router-outlet />
        </main>

        <nav class="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-surface border-t border-outline-variant flex justify-around items-center px-4 py-2">
          <a
            *ngFor="let item of mobileFamiliesItems"
            [routerLink]="item.path"
            routerLinkActive="bg-secondary-container text-on-secondary-container"
            class="flex flex-col items-center justify-center text-on-surface-variant px-3 py-1 rounded-full"
          >
            <span class="material-symbols-outlined">{{ item.icon }}</span>
            <span class="text-xs">{{ item.label }}</span>
          </a>
        </nav>
      </div>
    </ng-template>
  `
})
export class MainLayoutComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly navItems: NavItem[] = [
    { label: 'Inicio', path: '/app/home', icon: 'home', roles: ['ADMIN', 'COLEGIO', 'PROFESOR', 'APODERADO', 'ESTUDIANTE'], mobile: true },
    { label: 'Muro', path: '/app/feed', icon: 'dynamic_feed', roles: ['ADMIN', 'COLEGIO', 'PROFESOR', 'APODERADO', 'ESTUDIANTE'], mobile: true },
    { label: 'Cursos', path: '/app/courses', icon: 'school', roles: ['APODERADO', 'ESTUDIANTE'], mobile: true },
    { label: 'Calendario', path: '/app/calendar', icon: 'calendar_month', roles: ['ADMIN', 'COLEGIO', 'PROFESOR', 'APODERADO', 'ESTUDIANTE'] },
    { label: 'Notas', path: '/app/academic', icon: 'grade', roles: ['ADMIN', 'COLEGIO', 'PROFESOR', 'APODERADO', 'ESTUDIANTE'] },
    { label: 'Asistencia', path: '/app/attendance', icon: 'event_available', roles: ['ADMIN', 'COLEGIO', 'PROFESOR', 'APODERADO', 'ESTUDIANTE'] },
    { label: 'Mensajes', path: '/app/messages', icon: 'chat', roles: ['APODERADO', 'ESTUDIANTE'], mobile: true },
    { label: 'Perfil', path: '/app/profile', icon: 'person', roles: ['APODERADO', 'ESTUDIANTE'], mobile: true },
    { label: 'Estudiantes', path: '/app/users', icon: 'groups', roles: ['ADMIN', 'COLEGIO', 'PROFESOR'] },
    { label: 'Anotaciones', path: '/app/annotations', icon: 'assignment_late', roles: ['ADMIN', 'COLEGIO', 'PROFESOR'] },
    { label: 'Centro Mensajes', path: '/app/notifications', icon: 'mail', roles: ['ADMIN', 'COLEGIO', 'PROFESOR'] },
    { label: 'Riesgo', path: '/app/risk', icon: 'analytics', roles: ['ADMIN', 'COLEGIO', 'PROFESOR'] }
  ];

  get mobileFamiliesItems(): NavItem[] {
    return this.navItems.filter((item) => item.mobile && this.can(item.roles));
  }

  get backofficeNavItems(): NavItem[] {
    return this.navItems.filter((item) => !item.mobile && this.can(item.roles));
  }

  can(roles: RoleName[]): boolean {
    return this.auth.hasAnyRole(roles);
  }

  isFamiliesExperience(): boolean {
    return this.auth.hasAnyRole(['APODERADO', 'ESTUDIANTE']);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
