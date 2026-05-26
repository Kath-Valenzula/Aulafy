import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { RoleName } from '../../shared/models/aulafy.models';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-main-layout',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">
      <aside class="sidebar">
        <a class="brand" routerLink="/app/dashboard">
          <span class="brand-mark">A</span>
          <span>
            <strong>Aulafy</strong>
            <small>Gestion escolar</small>
          </span>
        </a>

        <nav class="nav-list">
          <a routerLink="/app/dashboard" routerLinkActive="active">Inicio</a>
          <a routerLink="/app/feed" routerLinkActive="active">Muro</a>
          <a routerLink="/app/calendar" routerLinkActive="active">Calendario</a>
          <a routerLink="/app/academic" routerLinkActive="active">Notas</a>
          <a routerLink="/app/attendance" routerLinkActive="active">Asistencia</a>
          <a *ngIf="can(['ADMIN', 'COLEGIO'])" routerLink="/app/users" routerLinkActive="active">Usuarios</a>
          <a *ngIf="can(['ADMIN', 'COLEGIO'])" routerLink="/app/courses" routerLinkActive="active">Cursos</a>
          <a *ngIf="can(['ADMIN', 'COLEGIO', 'PROFESOR'])" routerLink="/app/notifications" routerLinkActive="active">Telegram</a>
        </nav>
      </aside>

      <section class="main-panel">
        <header class="topbar">
          <div>
            <strong>{{ auth.currentUser?.fullName }}</strong>
            <span>{{ auth.currentUser?.role }}</span>
          </div>
          <button type="button" class="button ghost" (click)="logout()">Salir</button>
        </header>

        <main class="content">
          <router-outlet />
        </main>
      </section>
    </div>
  `
})
export class MainLayoutComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  can(roles: RoleName[]): boolean {
    return this.auth.hasAnyRole(roles);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
