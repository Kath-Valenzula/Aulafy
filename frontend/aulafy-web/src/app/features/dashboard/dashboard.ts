import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-heading">
      <div>
        <span class="eyebrow">Panel principal</span>
        <h2>Hola, {{ auth.currentUser?.fullName }}</h2>
      </div>
      <span class="role-badge">{{ auth.currentUser?.role }}</span>
    </section>

    <section class="metric-grid">
      <a class="metric-card" routerLink="/app/feed">
        <span>Muro</span>
        <strong>Publicaciones del curso</strong>
      </a>
      <a class="metric-card" routerLink="/app/calendar">
        <span>Calendario</span>
        <strong>Eventos academicos</strong>
      </a>
      <a class="metric-card" routerLink="/app/academic">
        <span>Notas</span>
        <strong>Seguimiento academico</strong>
      </a>
      <a class="metric-card" routerLink="/app/attendance">
        <span>Asistencia</span>
        <strong>Resumen y alertas</strong>
      </a>
    </section>

    <section class="work-area">
      <h3>Accesos segun rol</h3>
      <div class="quick-actions">
        <a class="button secondary" routerLink="/app/feed">Ver muro</a>
        <a class="button secondary" routerLink="/app/calendar">Ver calendario</a>
        <a class="button secondary" routerLink="/app/users" *ngIf="auth.hasAnyRole(['ADMIN', 'COLEGIO'])">Administrar usuarios</a>
        <a class="button secondary" routerLink="/app/notifications" *ngIf="auth.hasAnyRole(['ADMIN', 'COLEGIO', 'PROFESOR'])">Probar Telegram</a>
      </div>
    </section>
  `
})
export class DashboardComponent {
  readonly auth = inject(AuthService);
}
