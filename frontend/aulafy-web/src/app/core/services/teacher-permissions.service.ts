import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { CoursesService } from './courses.service';

interface TeacherPermissions {
  loaded: boolean;
  isSubjectTeacherOnly: boolean;
  hasHeadTeacherCourse: boolean;
}

const INITIAL: TeacherPermissions = { loaded: false, isSubjectTeacherOnly: false, hasHeadTeacherCourse: false };

@Injectable({ providedIn: 'root' })
export class TeacherPermissionsService {
  private readonly auth = inject(AuthService);
  private readonly coursesService = inject(CoursesService);
  private readonly state = new BehaviorSubject<TeacherPermissions>(INITIAL);

  readonly permissions$ = this.state.asObservable();

  get loaded(): boolean { return this.state.value.loaded; }

  get isSubjectTeacherOnly(): boolean {
    // fail-closed mientras se cargan los permisos: PROFESOR no ve módulos restringidos hasta confirmar rol
    if (!this.state.value.loaded && this.isProfesor) {
      return true;
    }
    return this.state.value.isSubjectTeacherOnly;
  }

  get hasHeadTeacherCourse(): boolean { return this.state.value.hasHeadTeacherCourse; }

  get canViewRisk(): boolean { return !this.isProfesor || !this.isSubjectTeacherOnly; }
  get canViewCourseChat(): boolean { return !this.isProfesor || !this.isSubjectTeacherOnly; }
  get canViewNotifications(): boolean { return !this.isProfesor || !this.isSubjectTeacherOnly; }

  private get isProfesor(): boolean {
    return this.auth.currentUser?.role === 'PROFESOR';
  }

  load(): void {
    if (this.state.value.loaded) {
      return;
    }
    if (!this.isProfesor) {
      this.state.next({ loaded: true, isSubjectTeacherOnly: false, hasHeadTeacherCourse: false });
      return;
    }

    this.coursesService.findAll().subscribe({
      next: (courses) => {
        const hasHead = courses.some((c) => c.myRoleInCourse === 'HEAD_TEACHER');
        const isSubjectOnly = !hasHead;
        this.state.next({ loaded: true, isSubjectTeacherOnly: isSubjectOnly, hasHeadTeacherCourse: hasHead });
      },
      error: () => {
        this.state.next({ loaded: true, isSubjectTeacherOnly: true, hasHeadTeacherCourse: false });
      }
    });
  }

  reset(): void {
    this.state.next(INITIAL);
  }
}
