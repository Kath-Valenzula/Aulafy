import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { TeacherPermissionsService } from '../../core/services/teacher-permissions.service';

interface DashboardAction {
  label: string;
  description: string;
  icon: string;
  path: string;
}

interface DashboardContext {
  title: string;
  subtitle: string;
  focus: string;
  actions: DashboardAction[];
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  template: `
    <section class="mb-6">
      <h1 class="text-3xl font-bold text-primary">{{ context.title }}</h1>
      <p class="text-on-surface-variant mt-1">{{ context.subtitle }}</p>
    </section>

    <section class="bg-surface rounded-xl border border-outline-variant p-6 mb-6">
      <div class="flex items-start gap-4">
        <div class="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center">
          <span class="material-symbols-outlined">verified_user</span>
        </div>
        <div>
          <p class="text-sm uppercase tracking-wider text-on-surface-variant font-semibold">Perfil activo</p>
          <h2 class="text-xl font-semibold text-primary mt-1">{{ auth.currentUser?.fullName }}</h2>
          <p class="text-sm text-on-surface-variant mt-1">{{ context.focus }}</p>
        </div>
      </div>
    </section>

    <section class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <a
        *ngFor="let action of context.actions"
        [routerLink]="action.path"
        class="bg-surface rounded-xl border border-outline-variant p-5 hover:bg-surface-container-low transition-colors"
      >
        <div class="w-11 h-11 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mb-4">
          <span class="material-symbols-outlined">{{ action.icon }}</span>
        </div>
        <h3 class="text-lg font-semibold text-primary">{{ action.label }}</h3>
        <p class="text-sm text-on-surface-variant mt-2">{{ action.description }}</p>
      </a>
    </section>
  `
})
export class DashboardComponent {
  readonly auth = inject(AuthService);
  private readonly teacherPermissions = inject(TeacherPermissionsService);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    this.teacherPermissions.permissions$.pipe(
      takeUntilDestroyed(inject(DestroyRef))
    ).subscribe(() => this.cdr.markForCheck());
  }

  get context(): DashboardContext {
    const role = this.auth.currentUser?.role;
    if (role === 'ADMIN') {
      return {
        title: 'Dashboard administrativo',
        subtitle: 'Control general de usuarios, estructura academica y seguimiento institucional.',
        focus: 'Acceso administrativo para mantener la configuracion base del MVP.',
        actions: [
          { label: 'Usuarios', description: 'Gestionar cuentas y roles principales.', icon: 'manage_accounts', path: '/app/users' },
          { label: 'Estudiantes', description: 'Revisar cuentas de estudiantes registradas.', icon: 'groups', path: '/app/users/students' },
          { label: 'Profesores', description: 'Revisar cuentas docentes disponibles.', icon: 'co_present', path: '/app/users/teachers' },
          { label: 'Apoderados', description: 'Revisar cuentas familiares vinculables.', icon: 'supervisor_account', path: '/app/users/guardians' },
          { label: 'Cursos', description: 'Administrar estructura de cursos.', icon: 'school', path: '/app/courses' },
          { label: 'Asignaturas', description: 'Consultar asignaturas por curso.', icon: 'menu_book', path: '/app/subjects' },
          { label: 'Reportes y riesgo', description: 'Acceder a reportes institucionales.', icon: 'analytics', path: '/app/risk' },
          { label: 'Notificaciones', description: 'Revisar bitacora de notificaciones externas.', icon: 'notifications_active', path: '/app/notifications' }
        ]
      };
    }

    if (role === 'COLEGIO') {
      return {
        title: 'Dashboard institucional',
        subtitle: 'Vista de coordinacion para cursos, comunicados, usuarios academicos y reportes.',
        focus: 'Acceso institucional para coordinar la operacion academica del colegio.',
        actions: [
          { label: 'Cursos', description: 'Revisar cursos visibles para la institucion.', icon: 'school', path: '/app/courses' },
          { label: 'Comunicados', description: 'Publicar y revisar avisos por curso.', icon: 'campaign', path: '/app/feed' },
          { label: 'Calendario institucional', description: 'Consultar eventos academicos.', icon: 'event_note', path: '/app/calendar' },
          { label: 'Usuarios academicos', description: 'Gestionar usuarios del entorno escolar.', icon: 'badge', path: '/app/users/academic' },
          { label: 'Reportes', description: 'Revisar indicadores de riesgo.', icon: 'analytics', path: '/app/risk' },
          { label: 'Notificaciones', description: 'Gestionar avisos externos opcionales.', icon: 'notifications_active', path: '/app/notifications' }
        ]
      };
    }

    if (this.teacherPermissions.isSubjectTeacherOnly) {
      return {
        title: 'Dashboard docente',
        subtitle: 'Acceso academico limitado a cursos y estudiantes autorizados.',
        focus: 'Acceso academico de profesor de asignatura. Algunas funciones institucionales estan reservadas para profesor jefe.',
        actions: [
          { label: 'Cursos asignados', description: 'Consultar cursos donde tienes asignatura.', icon: 'school', path: '/app/courses' },
          { label: 'Muro academico', description: 'Revisar publicaciones y comunicados del curso.', icon: 'dynamic_feed', path: '/app/feed' },
          { label: 'Calendario', description: 'Revisar pruebas y tareas programadas.', icon: 'calendar_month', path: '/app/calendar' },
          { label: 'Evaluaciones y notas', description: 'Crear evaluaciones y registrar notas de tu asignatura.', icon: 'grade', path: '/app/academic' },
          { label: 'Asistencia', description: 'Registrar asistencia basica del curso.', icon: 'event_available', path: '/app/attendance' },
          { label: 'Anotaciones', description: 'Registrar anotaciones academicas o de comunicacion.', icon: 'assignment_late', path: '/app/annotations' }
        ]
      };
    }

    return {
      title: 'Dashboard docente',
      subtitle: 'Acceso operativo a cursos asignados, evaluaciones, asistencia y comunicaciones.',
      focus: 'Acceso integral del curso como profesor jefe.',
      actions: [
        { label: 'Cursos asignados', description: 'Consultar cursos visibles para el docente.', icon: 'school', path: '/app/courses' },
        { label: 'Muro academico', description: 'Publicar y revisar comunicaciones del curso.', icon: 'dynamic_feed', path: '/app/feed' },
        { label: 'Calendario', description: 'Revisar eventos y evaluaciones programadas.', icon: 'calendar_month', path: '/app/calendar' },
        { label: 'Evaluaciones y notas', description: 'Crear evaluaciones y registrar calificaciones.', icon: 'grade', path: '/app/academic' },
        { label: 'Asistencia', description: 'Registrar y consultar asistencia.', icon: 'event_available', path: '/app/attendance' },
        { label: 'Anotaciones', description: 'Registrar observaciones academicas o conductuales.', icon: 'assignment_late', path: '/app/annotations' },
        { label: 'Mensajes del curso', description: 'Comunicacion directa con estudiantes y apoderados.', icon: 'chat', path: '/app/chat' },
        { label: 'Alertas de riesgo', description: 'Revisar indicadores de riesgo academico.', icon: 'warning', path: '/app/risk' },
        { label: 'Notificaciones', description: 'Revisar bitacora de avisos externos.', icon: 'notifications_active', path: '/app/notifications' }
      ]
    };
  }
}
