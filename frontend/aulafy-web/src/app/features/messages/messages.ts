import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-messages',
  imports: [CommonModule, RouterLink],
  template: `
    <section class="mb-5">
      <h2 class="text-2xl font-semibold text-on-background">{{ title }}</h2>
      <p class="text-sm text-on-surface-variant">{{ subtitle }}</p>
    </section>

    <section class="bg-surface rounded-xl border border-outline-variant p-5 mb-5">
      <div class="flex items-start gap-3">
        <div class="w-11 h-11 rounded-full bg-primary-container text-on-primary flex items-center justify-center">
          <span class="material-symbols-outlined">notifications</span>
        </div>
        <div>
          <h3 class="font-semibold text-primary">Sin avisos nuevos</h3>
          <p class="text-sm text-on-surface-variant mt-1">
            Las alertas visibles para este perfil se deben alimentar desde los modulos academicos y las notificaciones externas configuradas.
          </p>
        </div>
      </div>
    </section>

    <section class="grid grid-cols-1 gap-3">
      <a routerLink="/app/feed" class="bg-surface-container-low rounded-xl border border-outline-variant p-4 flex items-center gap-3">
        <span class="material-symbols-outlined text-primary">dynamic_feed</span>
        <div>
          <h4 class="font-semibold">Revisar comunicados</h4>
          <p class="text-sm text-on-surface-variant">Consulta publicaciones del curso.</p>
        </div>
      </a>
      <a routerLink="/app/calendar" class="bg-surface-container-low rounded-xl border border-outline-variant p-4 flex items-center gap-3">
        <span class="material-symbols-outlined text-primary">calendar_month</span>
        <div>
          <h4 class="font-semibold">Revisar calendario</h4>
          <p class="text-sm text-on-surface-variant">Consulta eventos y evaluaciones programadas.</p>
        </div>
      </a>
      <a routerLink="/app/profile" class="bg-surface-container-low rounded-xl border border-outline-variant p-4 flex items-center gap-3">
        <span class="material-symbols-outlined text-primary">person</span>
        <div>
          <h4 class="font-semibold">Perfil</h4>
          <p class="text-sm text-on-surface-variant">Revisa los datos visibles de tu cuenta.</p>
        </div>
      </a>
    </section>
  `
})
export class MessagesComponent {
  private readonly auth = inject(AuthService);

  get title(): string {
    return this.auth.hasAnyRole(['ESTUDIANTE']) ? 'Mis notificaciones' : 'Alertas y notificaciones';
  }

  get subtitle(): string {
    return this.auth.hasAnyRole(['ESTUDIANTE'])
      ? 'Avisos asociados a tu cuenta de estudiante.'
      : 'Avisos asociados a estudiantes vinculados.';
  }
}
