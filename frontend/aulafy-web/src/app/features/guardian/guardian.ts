import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-guardian',
  imports: [CommonModule, RouterLink],
  template: `
    <section class="bg-error-container rounded-xl p-4 flex items-start gap-3 border border-[#ffb4ab] mb-6">
      <span class="material-symbols-outlined text-on-error-container mt-0.5">error</span>
      <div>
        <h2 class="text-sm font-semibold text-on-error-container">Próxima reunión de apoderados</h2>
        <p class="text-sm text-on-error-container/90">Mañana 18:00 hrs. Asistencia obligatoria.</p>
      </div>
    </section>

    <section class="mb-6">
      <h2 class="text-xl font-semibold text-primary mb-3">Acciones rápidas</h2>
      <div class="grid grid-cols-4 gap-3">
        <a routerLink="/app/calendar" class="flex flex-col items-center justify-center p-3 bg-surface-container-low rounded-xl border border-outline-variant">
          <div class="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-on-primary mb-2">
            <span class="material-symbols-outlined">calendar_month</span>
          </div>
          <span class="text-xs text-on-surface">Calendario</span>
        </a>
        <a routerLink="/app/academic" class="flex flex-col items-center justify-center p-3 bg-surface-container-low rounded-xl border border-outline-variant">
          <div class="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-on-primary mb-2">
            <span class="material-symbols-outlined">grade</span>
          </div>
          <span class="text-xs text-on-surface">Notas</span>
        </a>
        <a routerLink="/app/messages" class="flex flex-col items-center justify-center p-3 bg-surface-container-low rounded-xl border border-outline-variant">
          <div class="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-on-primary mb-2">
            <span class="material-symbols-outlined">chat</span>
          </div>
          <span class="text-xs text-on-surface">Chat</span>
        </a>
        <a routerLink="/app/attendance" class="flex flex-col items-center justify-center p-3 bg-surface-container-low rounded-xl border border-outline-variant">
          <div class="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-on-primary mb-2">
            <span class="material-symbols-outlined">how_to_reg</span>
          </div>
          <span class="text-xs text-on-surface">Asistencia</span>
        </a>
      </div>
    </section>

    <section>
      <h2 class="text-xl font-semibold text-primary mb-4">Resumen semanal</h2>
      <div class="flex flex-col gap-4">
        <article class="bg-surface rounded-xl p-5 border border-outline-variant shadow-sm">
          <div class="flex items-center gap-2 mb-3">
            <span class="material-symbols-outlined text-primary">assignment</span>
            <h3 class="font-semibold">Próximas evaluaciones</h3>
          </div>
          <p class="text-sm text-on-surface-variant">Matemáticas - Viernes 12: Prueba de Álgebra.</p>
        </article>
        <article class="bg-surface rounded-xl p-5 border border-outline-variant shadow-sm">
          <div class="flex items-center gap-2 mb-3">
            <span class="material-symbols-outlined text-secondary">how_to_reg</span>
            <h3 class="font-semibold">Asistencia mensual</h3>
          </div>
          <p class="text-3xl font-bold text-primary">95%</p>
          <div class="w-full bg-surface-variant rounded-full h-2 mt-3">
            <div class="bg-secondary h-2 rounded-full w-[95%]"></div>
          </div>
        </article>
      </div>
    </section>
  `
})
export class GuardianComponent {
}
