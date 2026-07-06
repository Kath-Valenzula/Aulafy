import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { AcademicStructureService } from '../../core/services/academic-structure.service';
import { AttendanceService } from '../../core/services/attendance.service';
import { CoursesService } from '../../core/services/courses.service';
import { TeacherPermissionsService } from '../../core/services/teacher-permissions.service';
import {
  AttendanceResponse,
  AttendanceStatus,
  AttendanceSummaryResponse,
  CourseResponse
} from '../../shared/models/aulafy.models';

interface StudentOption {
  id: number;
  fullName: string;
}

@Component({
  selector: 'app-attendance',
  imports: [CommonModule, FormsModule],
  template: `
    <ng-container *ngIf="isFamiliesExperience; else backofficeAttendance">
      <section class="mb-5">
        <h2 class="text-2xl font-bold text-primary">Asistencia</h2>
      </section>

      <section *ngIf="loading" class="bg-surface rounded-xl border border-outline-variant p-4 mb-4 text-sm text-on-surface-variant">
        Cargando asistencia...
      </section>

      <section *ngIf="!loading && error" class="bg-error-container text-on-error-container rounded-xl p-4 mb-4 text-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <span>{{ error }}</span>
        <button (click)="retryLoad()" class="px-3 py-2 rounded-lg bg-surface text-primary font-semibold">Reintentar</button>
      </section>

      <section *ngIf="!loading && !error && !students.length" class="bg-surface rounded-xl border border-outline-variant p-4 mb-4 text-sm text-on-surface-variant">
        No existen estudiantes asociados para este perfil.
      </section>

      <ng-container *ngIf="!loading && !error && students.length">
        <section class="mb-4 overflow-x-auto pb-1">
          <div class="flex gap-2 w-max">
            <button
              *ngFor="let student of students"
              (click)="selectStudent(student.id)"
              class="px-4 py-2 rounded-full border border-outline-variant/30"
              [class.bg-primary]="student.id === selectedStudentId"
              [class.text-on-primary]="student.id === selectedStudentId"
              [class.bg-surface-container]="student.id !== selectedStudentId"
              [class.text-on-surface-variant]="student.id !== selectedStudentId"
            >
              {{ student.fullName }}
            </button>
          </div>
        </section>

        <section class="bg-surface rounded-xl shadow-sm p-6 flex flex-col items-center border border-outline-variant/30 mb-5">
          <h3 class="text-xs uppercase tracking-wider text-on-surface-variant mb-4">Resumen actual</h3>
          <div class="relative w-40 h-40 flex items-center justify-center mb-3">
            <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#d4e4fc" stroke-width="8"></circle>
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#0a6c44"
                stroke-width="8"
                stroke-dasharray="251.2"
                [attr.stroke-dashoffset]="donutOffset"
                stroke-linecap="round"
              ></circle>
            </svg>
            <div class="absolute text-3xl font-bold text-primary">{{ summary?.attendancePercentage ?? 0 }}%</div>
          </div>
          <span class="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-semibold">
            {{ summary?.status ?? 'SIN_DATOS' }}
          </span>
        </section>

        <button class="w-full bg-[#DD6B20] text-white font-semibold py-3.5 rounded-lg mb-5 flex justify-center items-center gap-2" disabled>
          <span class="material-symbols-outlined text-[20px]">edit_document</span>
          Justificación (pendiente de implementación)
        </button>

        <section class="bg-surface rounded-xl shadow-sm border border-outline-variant/30 p-4">
          <h3 class="text-lg font-semibold text-primary mb-4">Detalle del mes</h3>
          <div *ngIf="records.length" class="space-y-4">
            <article *ngFor="let record of records" class="border-l-2 border-surface-variant pl-3">
              <div class="flex justify-between mb-1">
                <strong>{{ record.date | date: 'dd/MM/yyyy' }}</strong>
                <span class="text-xs px-2 py-0.5 rounded" [ngClass]="statusClass(record.status)">{{ record.status }}</span>
              </div>
              <p class="text-sm text-on-surface-variant">{{ record.comment || 'Sin comentario registrado.' }}</p>
            </article>
          </div>
          <p *ngIf="!records.length" class="text-sm text-on-surface-variant">No hay registros de asistencia para el alumno seleccionado.</p>
        </section>
      </ng-container>
    </ng-container>

    <ng-template #backofficeAttendance>
      <section *ngIf="isSubjectTeacherOnly" class="bg-surface-variant rounded-xl border border-outline-variant p-4 mb-5 text-sm text-on-surface-variant">
        Como profesor de asignatura puedes registrar asistencia, pero la gestion integral del curso corresponde al profesor jefe.
      </section>

      <section class="mb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 class="text-3xl font-bold text-primary">Toma de Asistencia</h2>
          <p class="text-on-surface-variant mt-1">Registro y consulta consolidada por curso y alumno.</p>
        </div>
        <div class="bg-surface-container-high px-4 py-2 rounded-lg border border-outline-variant">
          <span class="text-sm text-on-surface-variant">Asistencia General:</span>
          <strong class="text-primary ml-2">{{ summary?.attendancePercentage ?? 0 }}%</strong>
        </div>
      </section>

      <section *ngIf="loading" class="bg-surface rounded-xl border border-outline-variant p-4 mb-5 text-sm text-on-surface-variant">
        Cargando asistencia...
      </section>

      <section *ngIf="!loading && error" class="bg-error-container text-on-error-container rounded-xl p-4 mb-5 text-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <span>{{ error }}</span>
        <button (click)="retryLoad()" class="px-3 py-2 rounded-lg bg-surface text-primary font-semibold">Reintentar</button>
      </section>

      <section *ngIf="!loading && !error && !courses.length" class="bg-surface rounded-xl border border-outline-variant p-4 mb-5 text-sm text-on-surface-variant">
        No hay cursos visibles para tu perfil.
      </section>

      <ng-container *ngIf="!loading && !error && courses.length">
        <section class="bg-surface rounded-xl p-6 border border-outline-variant shadow-sm mb-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              class="bg-background border border-outline-variant rounded-lg px-4 py-2.5"
              [ngModel]="selectedCourseId"
              (ngModelChange)="onCourseChange($event)"
            >
              <option *ngFor="let course of courses" [value]="course.id">{{ course.name }}</option>
            </select>
            <select
              class="bg-background border border-outline-variant rounded-lg px-4 py-2.5"
              [ngModel]="selectedStudentId"
              (ngModelChange)="onStudentChange($event)"
            >
              <option value="">Alumno</option>
              <option *ngFor="let student of students" [value]="student.id">{{ student.fullName }}</option>
            </select>
          </div>
        </section>

        <section class="bg-surface rounded-xl border border-outline-variant shadow-sm p-5 mb-5">
          <h3 class="font-semibold text-primary mb-4">Registrar asistencia</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input [(ngModel)]="attendanceDraft.date" type="date" class="bg-background border border-outline-variant rounded-lg px-3 py-2.5" />
            <select
              [ngModel]="attendanceDraft.status"
              (ngModelChange)="attendanceDraft.status = $event"
              class="bg-background border border-outline-variant rounded-lg px-3 py-2.5"
            >
              <option *ngFor="let status of attendanceStatuses" [value]="status">{{ status }}</option>
            </select>
            <input [(ngModel)]="attendanceDraft.comment" class="bg-background border border-outline-variant rounded-lg px-3 py-2.5" placeholder="Comentario (opcional)" />
          </div>
          <button
            (click)="createAttendance()"
            [disabled]="savingAttendance || !canCreateAttendance"
            class="mt-4 px-4 py-2 bg-primary-container text-on-primary rounded-lg font-semibold disabled:opacity-50"
          >
            {{ savingAttendance ? 'Guardando...' : 'Registrar asistencia' }}
          </button>
        </section>

        <section *ngIf="actionMessage" class="bg-secondary-container/30 border border-secondary/20 rounded-xl p-4 mb-5">
          <p class="text-sm text-on-secondary-container">{{ actionMessage }}</p>
        </section>

        <section class="bg-surface rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div class="p-4 border-b border-[#E2E8F0] bg-surface-bright">
            <p class="font-semibold text-primary">Historial del alumno seleccionado</p>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <th class="p-4 text-left text-xs uppercase text-on-surface-variant">Fecha</th>
                  <th class="p-4 text-left text-xs uppercase text-on-surface-variant">Comentario</th>
                  <th class="p-4 text-center text-xs uppercase text-on-surface-variant">Estado final</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngIf="!records.length" class="border-b border-[#E2E8F0]">
                  <td colspan="3" class="p-4 text-sm text-on-surface-variant">No existen registros de asistencia para este alumno.</td>
                </tr>
                <tr *ngFor="let record of records" class="border-b border-[#E2E8F0]">
                  <td class="p-4">{{ record.date | date: 'dd/MM/yyyy' }}</td>
                  <td class="p-4">{{ record.comment || '-' }}</td>
                  <td class="p-4 text-center">
                    <span class="text-xs px-2 py-1 rounded-full" [ngClass]="statusClass(record.status)">{{ record.status }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </ng-container>
    </ng-template>
  `
})
export class AttendanceComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly attendanceService = inject(AttendanceService);
  private readonly academicStructureService = inject(AcademicStructureService);
  private readonly coursesService = inject(CoursesService);
  private readonly teacherPermissions = inject(TeacherPermissionsService);

  get isSubjectTeacherOnly(): boolean {
    return this.teacherPermissions.isSubjectTeacherOnly;
  }

  students: StudentOption[] = [];
  courses: CourseResponse[] = [];
  selectedCourseId: number | null = null;
  selectedStudentId: number | null = null;
  records: AttendanceResponse[] = [];
  summary: AttendanceSummaryResponse | null = null;
  loading = true;
  error = '';
  actionMessage = '';
  savingAttendance = false;
  attendanceStatuses: AttendanceStatus[] = ['PRESENTE', 'AUSENTE', 'JUSTIFICADO', 'ATRASADO'];

  attendanceDraft: {
    date: string;
    status: AttendanceStatus;
    comment: string;
  } = {
    date: todayIsoDate(),
    status: 'PRESENTE',
    comment: ''
  };

  get isFamiliesExperience(): boolean {
    return this.auth.hasAnyRole(['APODERADO', 'ESTUDIANTE']);
  }

  get donutOffset(): number {
    const circumference = 251.2;
    const percentage = this.summary?.attendancePercentage ?? 0;
    return Number((circumference * (1 - percentage / 100)).toFixed(1));
  }

  get canCreateAttendance(): boolean {
    return Boolean(this.selectedCourseId && this.selectedStudentId && this.attendanceDraft.date && this.attendanceDraft.status);
  }

  ngOnInit(): void {
    if (this.isFamiliesExperience) {
      this.loadFamilyStudents();
      return;
    }
    this.loadBackofficeCourses();
  }

  retryLoad(): void {
    if (this.isFamiliesExperience) {
      this.loadFamilyStudents();
      return;
    }
    this.loadBackofficeCourses();
  }

  selectStudent(studentId: number): void {
    if (this.selectedStudentId === studentId) {
      return;
    }
    this.selectedStudentId = studentId;
    this.fetchAttendance(studentId);
  }

  onCourseChange(value: number | string): void {
    const normalized = Number(value);
    if (!normalized || this.selectedCourseId === normalized) {
      return;
    }
    this.selectedCourseId = normalized;
    this.actionMessage = '';
    this.loadBackofficeStudentsByCourse(normalized);
  }

  onStudentChange(value: number | string): void {
    const normalized = Number(value);
    if (!normalized || this.selectedStudentId === normalized) {
      return;
    }
    this.selectedStudentId = normalized;
    this.fetchAttendance(normalized);
  }

  createAttendance(): void {
    if (!this.canCreateAttendance || !this.selectedCourseId || !this.selectedStudentId) {
      return;
    }

    this.savingAttendance = true;
    this.actionMessage = '';

    this.attendanceService
      .create({
        studentId: this.selectedStudentId,
        courseId: this.selectedCourseId,
        date: this.attendanceDraft.date,
        status: this.attendanceDraft.status,
        comment: this.attendanceDraft.comment || null
      })
      .subscribe({
        next: () => {
          this.savingAttendance = false;
          this.actionMessage = 'Asistencia registrada correctamente.';
          this.attendanceDraft.comment = '';
          this.fetchAttendance(this.selectedStudentId!);
        },
        error: (error) => {
          console.error('Error al registrar asistencia', error);
          this.savingAttendance = false;
          this.actionMessage = 'No fue posible registrar la asistencia.';
        }
      });
  }

  statusClass(status: string): string {
    if (status === 'PRESENTE') {
      return 'bg-secondary/10 text-secondary';
    }
    if (status === 'AUSENTE') {
      return 'bg-error/10 text-error';
    }
    if (status === 'ATRASADO') {
      return 'bg-[#DD6B20]/10 text-[#DD6B20]';
    }
    return 'bg-surface-variant text-on-surface-variant';
  }

  private loadFamilyStudents(): void {
    this.loading = true;
    this.error = '';

    this.academicStructureService.students().subscribe({
      next: (students) => {
        this.students = students.map((student) => ({ id: student.id, fullName: student.fullName }));
        if (!this.students.length) {
          this.loading = false;
          return;
        }

        this.selectedStudentId = this.students[0].id;
        this.fetchAttendance(this.students[0].id);
      },
      error: (error) => {
        console.error('Error al cargar alumnos vinculados', error);
        this.error = 'No fue posible cargar la informacion. Intenta nuevamente.';
        this.loading = false;
      }
    });
  }

  private loadBackofficeCourses(): void {
    this.loading = true;
    this.error = '';

    this.coursesService.findAll().subscribe({
      next: (courses) => {
        this.courses = courses;
        if (!courses.length) {
          this.loading = false;
          return;
        }

        this.selectedCourseId = courses[0].id;
        this.loadBackofficeStudentsByCourse(courses[0].id);
      },
      error: (error) => {
        console.error('Error al cargar cursos para asistencia', error);
        this.error = 'No fue posible cargar la informacion. Intenta nuevamente.';
        this.loading = false;
      }
    });
  }

  private loadBackofficeStudentsByCourse(courseId: number): void {
    this.loading = true;
    this.error = '';

    this.coursesService.students(courseId).subscribe({
      next: (students) => {
        this.students = students.map((student) => ({ id: student.id, fullName: student.fullName }));
        if (!this.students.length) {
          this.records = [];
          this.summary = null;
          this.selectedStudentId = null;
          this.loading = false;
          return;
        }

        this.selectedStudentId = this.students[0].id;
        this.fetchAttendance(this.students[0].id);
      },
      error: (error) => {
        console.error('Error al cargar alumnos del curso', error);
        this.error = 'No fue posible cargar la informacion. Intenta nuevamente.';
        this.loading = false;
      }
    });
  }

  private fetchAttendance(studentId: number): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      records: this.attendanceService.records(studentId),
      summary: this.attendanceService.summary(studentId)
    }).subscribe({
      next: ({ records, summary }) => {
        this.records = records;
        this.summary = summary;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar asistencia del alumno', error);
        this.error = 'No fue posible cargar la informacion. Intenta nuevamente.';
        this.loading = false;
      }
    });
  }
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}
