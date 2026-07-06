import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { RoleNavigationItem, navigationForRole } from '../../core/navigation/role-navigation';
import { TeacherPermissionsService } from '../../core/services/teacher-permissions.service';

@Component({
  selector: 'app-main-layout',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="bg-background text-on-background min-h-screen font-inter" *ngIf="!isFamiliesExperience(); else familiesLayout">
      <nav class="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant py-6 pr-4 z-40">
        <div class="px-6 mb-8 flex items-center gap-4">
          <img src="/aulafy-icon.png" alt="Aulafy" class="h-14 w-auto" />
          <div>
            <h2 class="font-semibold text-primary">{{ workspaceTitle }}</h2>
            <p class="text-xs text-on-surface-variant">{{ workspaceSubtitle }}</p>
          </div>
        </div>

        <div class="flex flex-col gap-1 flex-1">
          <a
            *ngFor="let item of backofficeNavItems"
            [routerLink]="item.path"
            routerLinkActive="bg-secondary-container text-on-secondary-container font-bold"
            [routerLinkActiveOptions]="{ exact: true }"
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
            <img src="/aulafy-icon.png" alt="Aulafy" class="h-10 w-auto" />
            <h1 class="font-semibold text-primary">{{ workspaceTitle }}</h1>
          </div>
          <a routerLink="/app/messages" class="text-on-surface-variant">
            <span class="material-symbols-outlined">notifications</span>
          </a>
        </header>

        <main class="pt-20 px-4 pb-24 max-w-md mx-auto">
          <router-outlet />
        </main>

        <nav class="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-surface border-t border-outline-variant flex items-center gap-2 px-3 py-2 overflow-x-auto">
          <a
            *ngFor="let item of mobileFamiliesItems"
            [routerLink]="item.path"
            routerLinkActive="bg-secondary-container text-on-secondary-container"
            [routerLinkActiveOptions]="{ exact: true }"
            class="min-w-16 flex flex-col items-center justify-center text-on-surface-variant px-3 py-1 rounded-full"
          >
            <span class="material-symbols-outlined">{{ item.icon }}</span>
            <span class="text-xs">{{ item.label }}</span>
          </a>
        </nav>
      </div>
    </ng-template>
  `
})
export class MainLayoutComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly teacherPermissions = inject(TeacherPermissionsService);

  ngOnInit(): void {
    this.teacherPermissions.load();
  }

  get mobileFamiliesItems(): RoleNavigationItem[] {
    return navigationForRole(this.auth.currentUser?.role, 'family');
  }

  get backofficeNavItems(): RoleNavigationItem[] {
    const items = navigationForRole(this.auth.currentUser?.role, 'backoffice');
    if (this.auth.currentUser?.role !== 'PROFESOR' || !this.teacherPermissions.isSubjectTeacherOnly) {
      return items;
    }
    const blocked = new Set(['/app/risk', '/app/chat', '/app/notifications']);
    return items.filter((item) => !blocked.has(item.path));
  }

  get workspaceTitle(): string {
    const role = this.auth.currentUser?.role;
    if (role === 'ADMIN') {
      return 'Aulafy Admin';
    }
    if (role === 'COLEGIO') {
      return 'Aulafy Colegio';
    }
    if (role === 'PROFESOR') {
      return 'Aulafy Docente';
    }
    if (role === 'APODERADO') {
      return 'Aulafy Familia';
    }
    if (role === 'ESTUDIANTE') {
      return 'Aulafy Estudiante';
    }
    return 'Aulafy';
  }

  get workspaceSubtitle(): string {
    const role = this.auth.currentUser?.role;
    if (role === 'ADMIN') {
      return 'Administracion general';
    }
    if (role === 'COLEGIO') {
      return 'Gestion institucional';
    }
    if (role === 'PROFESOR') {
      return 'Gestion docente';
    }
    return 'Seguimiento academico';
  }

  isFamiliesExperience(): boolean {
    return this.auth.hasAnyRole(['APODERADO', 'ESTUDIANTE']);
  }

  logout(): void {
    this.auth.logout();
    this.teacherPermissions.reset();
    this.router.navigateByUrl('/login');
  }
}
