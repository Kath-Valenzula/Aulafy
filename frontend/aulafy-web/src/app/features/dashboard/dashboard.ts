import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  template: `
    <section class="mb-6">
      <h1 class="text-3xl font-bold text-primary">Bienvenido, {{ auth.currentUser?.fullName || 'Profesor' }}</h1>
      <p class="text-on-surface-variant mt-1">Resumen operativo para hoy</p>
    </section>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div class="xl:col-span-2 flex flex-col gap-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <article class="bg-surface rounded-xl border border-outline-variant p-6 flex items-center justify-between">
            <div>
              <p class="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Promedio general curso</p>
              <p class="text-4xl font-bold text-primary mt-1">5.8</p>
            </div>
            <div class="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary-container">
              <span class="material-symbols-outlined text-3xl">trending_up</span>
            </div>
          </article>
          <article class="bg-surface rounded-xl border border-outline-variant p-6 flex items-center justify-between">
            <div>
              <p class="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Asistencia hoy</p>
              <p class="text-4xl font-bold text-primary mt-1">92%</p>
            </div>
            <div class="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <span class="material-symbols-outlined text-3xl">group</span>
            </div>
          </article>
        </div>

        <article class="bg-surface rounded-xl border border-outline-variant overflow-hidden">
          <div class="p-6 border-b border-surface-variant flex justify-between items-center bg-surface-bright">
            <h3 class="text-xl font-semibold text-primary flex items-center gap-2">
              <span class="material-symbols-outlined text-primary-container">fact_check</span>
              Tareas pendientes del día
            </h3>
            <span class="bg-error-container text-on-error-container text-xs px-2 py-1 rounded-full font-semibold">3 pendientes</span>
          </div>
          <ul class="p-6 space-y-3">
            <li class="p-3 rounded-lg border border-outline-variant/40">
              <strong>Toma de asistencia 7mo A</strong>
              <p class="text-sm text-on-surface-variant">Bloque 1 - 08:00 AM</p>
            </li>
            <li class="p-3 rounded-lg border border-outline-variant/40">
              <strong>Cargar notas ensayo SIMCE</strong>
              <p class="text-sm text-on-surface-variant">Sistema de evaluación - Lenguaje</p>
            </li>
            <li class="p-3 rounded-lg border border-outline-variant/40">
              <strong>Revisar 3 chats nuevos</strong>
              <p class="text-sm text-on-surface-variant">Mensajes de apoderados 8vo B</p>
            </li>
          </ul>
        </article>
      </div>

      <aside class="flex flex-col gap-6">
        <article class="bg-surface rounded-xl border border-outline-variant p-6">
          <h3 class="text-xl font-semibold text-primary mb-4">Agenda semanal</h3>
          <div class="space-y-3">
            <div class="border-l-4 border-primary bg-primary-fixed/40 p-3 rounded-r-lg">
              <p class="text-sm text-primary-container font-semibold">08:00 - 09:30</p>
              <p class="text-sm font-medium">Matemáticas 7mo A</p>
            </div>
            <div class="border-l-4 border-outline bg-surface-container-high p-3 rounded-r-lg">
              <p class="text-sm text-on-surface-variant font-semibold">09:45 - 11:15</p>
              <p class="text-sm font-medium">Reunión de departamento</p>
            </div>
          </div>
        </article>

        <article class="bg-surface rounded-xl border border-outline-variant p-6">
          <h3 class="text-xl font-semibold text-primary mb-4">Acciones rápidas</h3>
          <div class="grid grid-cols-2 gap-3">
            <a routerLink="/app/attendance" class="p-4 rounded-lg bg-surface-container-low border border-outline-variant text-center">
              <span class="material-symbols-outlined text-primary block mb-2">event_available</span>
              <span class="text-sm font-medium">Asistencia</span>
            </a>
            <a routerLink="/app/academic" class="p-4 rounded-lg bg-surface-container-low border border-outline-variant text-center">
              <span class="material-symbols-outlined text-primary block mb-2">grade</span>
              <span class="text-sm font-medium">Notas</span>
            </a>
            <a routerLink="/app/annotations" class="p-4 rounded-lg bg-surface-container-low border border-outline-variant text-center">
              <span class="material-symbols-outlined text-primary block mb-2">assignment_late</span>
              <span class="text-sm font-medium">Anotaciones</span>
            </a>
            <a routerLink="/app/notifications" class="p-4 rounded-lg bg-surface-container-low border border-outline-variant text-center">
              <span class="material-symbols-outlined text-primary block mb-2">chat</span>
              <span class="text-sm font-medium">Mensajes</span>
            </a>
          </div>
        </article>
      </aside>
    </div>
  `
})
export class DashboardComponent {
  readonly auth = inject(AuthService);
}
