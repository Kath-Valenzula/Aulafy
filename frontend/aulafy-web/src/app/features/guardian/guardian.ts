import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

interface FamilyAction {
  label: string;
  description: string;
  icon: string;
  path: string;
}

@Component({
  selector: 'app-guardian',
  imports: [CommonModule, RouterLink],
  template: `
    <section class="mb-6">
      <p class="text-sm text-on-surface-variant">{{ roleLabel }}</p>
      <h2 class="text-2xl font-bold text-primary">{{ title }}</h2>
      <p class="text-sm text-on-surface-variant mt-1">{{ subtitle }}</p>
    </section>

    <section class="bg-surface rounded-xl border border-outline-variant p-5 mb-6">
      <div class="flex items-start gap-3">
        <div class="w-11 h-11 rounded-full bg-primary-container text-on-primary flex items-center justify-center">
          <span class="material-symbols-outlined">account_circle</span>
        </div>
        <div>
          <h3 class="font-semibold text-primary">{{ auth.currentUser?.fullName }}</h3>
          <p class="text-sm text-on-surface-variant">{{ summaryText }}</p>
        </div>
      </div>
    </section>

    <section>
      <h3 class="text-lg font-semibold text-primary mb-4">Accesos principales</h3>
      <div class="grid grid-cols-2 gap-3">
        <a
          *ngFor="let action of actions"
          [routerLink]="action.path"
          class="bg-surface-container-low rounded-xl border border-outline-variant p-4 min-h-32 flex flex-col"
        >
          <div class="w-11 h-11 rounded-full bg-primary-container text-on-primary flex items-center justify-center mb-3">
            <span class="material-symbols-outlined">{{ action.icon }}</span>
          </div>
          <span class="font-semibold text-sm text-primary">{{ action.label }}</span>
          <span class="text-xs text-on-surface-variant mt-1">{{ action.description }}</span>
        </a>
      </div>
    </section>
  `
})
export class GuardianComponent {
  readonly auth = inject(AuthService);

  get isStudent(): boolean {
    return this.auth.hasAnyRole(['ESTUDIANTE']);
  }

  get roleLabel(): string {
    return this.isStudent ? 'Vista estudiante' : 'Vista familia';
  }

  get title(): string {
    return this.isStudent ? 'Dashboard estudiante' : 'Dashboard familia';
  }

  get subtitle(): string {
    return this.isStudent
      ? 'Acceso a comunicados, calendario, notas, asistencia, mensajes del curso y perfil propio.'
      : 'Seguimiento de estudiantes vinculados, comunicados, calendario, mensajes del curso y alertas.';
  }

  get summaryText(): string {
    return this.isStudent
      ? 'La informacion visible debe corresponder solo al usuario estudiante autenticado.'
      : 'La informacion visible debe corresponder solo a estudiantes vinculados al apoderado.';
  }

  get actions(): FamilyAction[] {
    if (this.isStudent) {
      return [
        { label: 'Muro academico', description: 'Comunicados del curso.', icon: 'dynamic_feed', path: '/app/feed' },
        { label: 'Calendario', description: 'Eventos y evaluaciones.', icon: 'calendar_month', path: '/app/calendar' },
        { label: 'Mis notas', description: 'Calificaciones propias.', icon: 'grade', path: '/app/academic' },
        { label: 'Mi asistencia', description: 'Registro personal.', icon: 'event_available', path: '/app/attendance' },
        { label: 'Mensajes del curso', description: 'Chat con el profesor del curso.', icon: 'chat', path: '/app/chat' },
        { label: 'Perfil', description: 'Datos de cuenta.', icon: 'person', path: '/app/profile' }
      ];
    }

    return [
      { label: 'Estudiantes', description: 'Seguimiento de vinculados.', icon: 'groups', path: '/app/guardian/students' },
      { label: 'Muro', description: 'Comunicados del curso.', icon: 'dynamic_feed', path: '/app/feed' },
      { label: 'Calendario', description: 'Eventos academicos.', icon: 'calendar_month', path: '/app/calendar' },
      { label: 'Notas', description: 'Calificaciones por estudiante.', icon: 'grade', path: '/app/academic' },
      { label: 'Asistencia', description: 'Registro de asistencia.', icon: 'event_available', path: '/app/attendance' },
      { label: 'Mensajes del curso', description: 'Chat iniciado por el profesor.', icon: 'chat', path: '/app/chat' },
      { label: 'Perfil', description: 'Datos de cuenta.', icon: 'person', path: '/app/profile' }
    ];
  }
}
