import { RoleName } from '../../shared/models/aulafy.models';

export type NavigationLayout = 'backoffice' | 'family';

export interface RoleNavigationItem {
  label: string;
  path: string;
  icon: string;
  roles: RoleName[];
  layout: NavigationLayout;
}

export const ROLE_HOME_PATH: Record<RoleName, string> = {
  ADMIN: '/app/dashboard',
  COLEGIO: '/app/dashboard',
  PROFESOR: '/app/dashboard',
  APODERADO: '/app/guardian',
  ESTUDIANTE: '/app/guardian'
};

export const ROLE_NAVIGATION_ITEMS: RoleNavigationItem[] = [
  { label: 'Dashboard admin', path: '/app/dashboard', icon: 'admin_panel_settings', roles: ['ADMIN'], layout: 'backoffice' },
  { label: 'Usuarios', path: '/app/users', icon: 'manage_accounts', roles: ['ADMIN'], layout: 'backoffice' },
  { label: 'Estudiantes', path: '/app/users/students', icon: 'groups', roles: ['ADMIN'], layout: 'backoffice' },
  { label: 'Profesores', path: '/app/users/teachers', icon: 'co_present', roles: ['ADMIN'], layout: 'backoffice' },
  { label: 'Apoderados', path: '/app/users/guardians', icon: 'supervisor_account', roles: ['ADMIN'], layout: 'backoffice' },
  { label: 'Cursos', path: '/app/courses', icon: 'school', roles: ['ADMIN'], layout: 'backoffice' },
  { label: 'Asignaturas', path: '/app/subjects', icon: 'menu_book', roles: ['ADMIN'], layout: 'backoffice' },
  { label: 'Reportes y riesgo', path: '/app/risk', icon: 'analytics', roles: ['ADMIN'], layout: 'backoffice' },
  { label: 'Notificaciones', path: '/app/notifications', icon: 'notifications_active', roles: ['ADMIN'], layout: 'backoffice' },

  { label: 'Dashboard institucional', path: '/app/dashboard', icon: 'domain', roles: ['COLEGIO'], layout: 'backoffice' },
  { label: 'Cursos', path: '/app/courses', icon: 'school', roles: ['COLEGIO'], layout: 'backoffice' },
  { label: 'Comunicados', path: '/app/feed', icon: 'campaign', roles: ['COLEGIO'], layout: 'backoffice' },
  { label: 'Calendario institucional', path: '/app/calendar', icon: 'event_note', roles: ['COLEGIO'], layout: 'backoffice' },
  { label: 'Usuarios academicos', path: '/app/users/academic', icon: 'badge', roles: ['COLEGIO'], layout: 'backoffice' },
  { label: 'Reportes', path: '/app/risk', icon: 'analytics', roles: ['COLEGIO'], layout: 'backoffice' },
  { label: 'Notificaciones', path: '/app/notifications', icon: 'notifications_active', roles: ['COLEGIO'], layout: 'backoffice' },

  { label: 'Dashboard docente', path: '/app/dashboard', icon: 'dashboard', roles: ['PROFESOR'], layout: 'backoffice' },
  { label: 'Cursos asignados', path: '/app/courses', icon: 'school', roles: ['PROFESOR'], layout: 'backoffice' },
  { label: 'Muro academico', path: '/app/feed', icon: 'dynamic_feed', roles: ['PROFESOR'], layout: 'backoffice' },
  { label: 'Calendario', path: '/app/calendar', icon: 'calendar_month', roles: ['PROFESOR'], layout: 'backoffice' },
  { label: 'Evaluaciones y notas', path: '/app/academic', icon: 'grade', roles: ['PROFESOR'], layout: 'backoffice' },
  { label: 'Asistencia', path: '/app/attendance', icon: 'event_available', roles: ['PROFESOR'], layout: 'backoffice' },
  { label: 'Anotaciones', path: '/app/annotations', icon: 'assignment_late', roles: ['PROFESOR'], layout: 'backoffice' },
  { label: 'Mensajes del curso', path: '/app/chat', icon: 'chat', roles: ['PROFESOR'], layout: 'backoffice' },
  { label: 'Notificaciones', path: '/app/notifications', icon: 'notifications_active', roles: ['PROFESOR'], layout: 'backoffice' },

  { label: 'Dashboard', path: '/app/guardian', icon: 'home', roles: ['APODERADO', 'ESTUDIANTE'], layout: 'family' },
  { label: 'Estudiantes', path: '/app/guardian/students', icon: 'groups', roles: ['APODERADO'], layout: 'family' },
  { label: 'Muro', path: '/app/feed', icon: 'dynamic_feed', roles: ['APODERADO', 'ESTUDIANTE'], layout: 'family' },
  { label: 'Calendario', path: '/app/calendar', icon: 'calendar_month', roles: ['APODERADO', 'ESTUDIANTE'], layout: 'family' },
  { label: 'Notas', path: '/app/academic', icon: 'grade', roles: ['APODERADO', 'ESTUDIANTE'], layout: 'family' },
  { label: 'Asistencia', path: '/app/attendance', icon: 'event_available', roles: ['APODERADO', 'ESTUDIANTE'], layout: 'family' },
  { label: 'Mensajes del curso', path: '/app/chat', icon: 'chat', roles: ['APODERADO', 'ESTUDIANTE'], layout: 'family' },
  { label: 'Perfil', path: '/app/profile', icon: 'person', roles: ['APODERADO', 'ESTUDIANTE'], layout: 'family' }
];

export function homePathForRole(role: RoleName | null | undefined): string {
  return role ? ROLE_HOME_PATH[role] : '/login';
}

export function hasRoleAccess(roles: RoleName[] | undefined, role: RoleName | null | undefined): boolean {
  return !roles || Boolean(role && roles.includes(role));
}

export function navigationForRole(role: RoleName | null | undefined, layout: NavigationLayout): RoleNavigationItem[] {
  if (!role) {
    return [];
  }
  return ROLE_NAVIGATION_ITEMS.filter((item) => item.layout === layout && item.roles.includes(role));
}
