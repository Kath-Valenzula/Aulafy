import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  template: `
    <section class="flex flex-col items-center text-center mb-6">
      <div class="w-24 h-24 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-3xl font-bold">A</div>
      <h2 class="text-xl font-semibold mt-3">Ana Silva Rojas</h2>
      <span class="inline-flex px-3 py-1 bg-surface-variant text-on-surface-variant rounded-full text-xs mt-2">Apoderado</span>
    </section>

    <section class="bg-surface rounded-xl border border-outline-variant/40 shadow-sm overflow-hidden mb-5">
      <div class="p-4 border-b border-outline-variant/20">
        <h3 class="font-semibold">Estudiante vinculado</h3>
      </div>
      <div class="p-4">
        <p class="font-medium">Mateo Torres Silva</p>
        <p class="text-sm text-on-surface-variant">4º Básico - Curso B</p>
      </div>
    </section>

    <section class="bg-surface rounded-xl border border-outline-variant/40 shadow-sm overflow-hidden">
      <div class="p-4 border-b border-outline-variant/20"><h3 class="font-semibold">Preferencias</h3></div>
      <div class="p-4 space-y-4">
        <div>
          <p class="font-medium">Notificaciones push</p>
          <p class="text-sm text-on-surface-variant">Avisos urgentes y asistencia.</p>
        </div>
        <div>
          <p class="font-medium">Correos electrónicos</p>
          <p class="text-sm text-on-surface-variant">Resumen semanal y notas.</p>
        </div>
      </div>
    </section>
  `
})
export class ProfileComponent {}
