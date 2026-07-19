import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AnnotationsService } from '../../core/services/annotations.service';
import { CoursesService } from '../../core/services/courses.service';
import {
  AnnotationResponse,
  AnnotationSeverity,
  AnnotationType,
  CourseResponse,
  CourseStudentResponse
} from '../../shared/models/aulafy.models';

@Component({
  selector: 'app-annotations',
  imports: [CommonModule, FormsModule],
  template: `
    <section class="mb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 class="text-3xl font-bold text-on-background">Gestión de Anotaciones</h2>
        <p class="text-on-surface-variant">Registra y monitorea comportamiento y desempeño del estudiante.</p>
      </div>
    </section>

    <section *ngIf="loading" class="bg-surface rounded-xl border border-outline-variant p-4 mb-5 text-sm text-on-surface-variant">
      Cargando anotaciones...
    </section>

    <section *ngIf="!loading && error" class="bg-error-container text-on-error-container rounded-xl p-4 mb-5 text-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
      <span>{{ error }}</span>
      <button (click)="retryLoad()" class="px-3 py-2 rounded-lg bg-surface text-primary font-semibold">Reintentar</button>
    </section>

    <section *ngIf="!loading && !error && !courses.length" class="bg-surface rounded-xl border border-outline-variant p-4 mb-5 text-sm text-on-surface-variant">
      No hay cursos disponibles para anotaciones.
    </section>

    <ng-container *ngIf="!loading && !error && courses.length">
      <section class="bg-surface p-4 rounded-lg shadow-sm border border-outline-variant/30 mb-5 grid grid-cols-1 md:grid-cols-4 gap-3">
        <select
          class="bg-surface-bright border border-outline-variant rounded-md px-3 py-2"
          [ngModel]="selectedCourseId"
          (ngModelChange)="onCourseChange($event)"
        >
          <option *ngFor="let course of courses" [value]="course.id">{{ course.name }}</option>
        </select>
        <select
          class="bg-surface-bright border border-outline-variant rounded-md px-3 py-2"
          [ngModel]="selectedStudentId"
          (ngModelChange)="onStudentFilterChange($event)"
        >
          <option value="">Todos los alumnos</option>
          <option *ngFor="let student of students" [value]="student.id">{{ student.fullName }}</option>
        </select>
        <select
          class="bg-surface-bright border border-outline-variant rounded-md px-3 py-2"
          [ngModel]="selectedTypeFilter"
          (ngModelChange)="selectedTypeFilter = normalizeFilter($event)"
        >
          <option value="">Tipo: Todos</option>
          <option *ngFor="let type of visibleTypeFilters" [value]="type">{{ type }}</option>
        </select>
        <select
          class="bg-surface-bright border border-outline-variant rounded-md px-3 py-2"
          [ngModel]="selectedSeverityFilter"
          (ngModelChange)="selectedSeverityFilter = normalizeFilter($event)"
        >
          <option value="">Severidad: Todas</option>
          <option *ngFor="let severity of annotationSeverities" [value]="severity">{{ severity }}</option>
        </select>
      </section>

      <section class="bg-surface rounded-xl border border-outline-variant shadow-sm p-5 mb-5">
        <h3 class="font-semibold text-primary mb-4">Registrar nueva anotación</h3>
        <div *ngIf="isRestrictedTeacher" class="mb-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
          <span class="font-bold mt-0.5">!</span>
          <span>Las anotaciones conductuales son exclusivas del profesor jefe. Solo puedes registrar anotaciones académicas y de comunicación.</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select
            class="bg-surface-bright border border-outline-variant rounded-md px-3 py-2"
            [ngModel]="annotationDraft.studentId"
            (ngModelChange)="annotationDraft.studentId = normalizeNullableNumber($event)"
          >
            <option value="">Alumno</option>
            <option *ngFor="let student of students" [value]="student.id">{{ student.fullName }}</option>
          </select>
          <select
            class="bg-surface-bright border border-outline-variant rounded-md px-3 py-2"
            [ngModel]="annotationDraft.type"
            (ngModelChange)="annotationDraft.type = $event"
          >
            <option *ngFor="let type of visibleAnnotationTypes" [value]="type">{{ type }}</option>
          </select>
          <select
            class="bg-surface-bright border border-outline-variant rounded-md px-3 py-2"
            [ngModel]="annotationDraft.severity"
            (ngModelChange)="annotationDraft.severity = $event"
          >
            <option *ngFor="let severity of annotationSeverities" [value]="severity">{{ severity }}</option>
          </select>
          <input
            [(ngModel)]="annotationDraft.title"
            class="bg-surface-bright border border-outline-variant rounded-md px-3 py-2"
            placeholder="Título"
          />
          <textarea
            [(ngModel)]="annotationDraft.description"
            class="bg-surface-bright border border-outline-variant rounded-md px-3 py-2 md:col-span-2 min-h-24"
            placeholder="Descripción"
          ></textarea>
        </div>
        <button
          (click)="createAnnotation()"
          [disabled]="saving || !canCreateAnnotation"
          class="mt-4 bg-[#1A365D] text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          {{ saving ? 'Guardando...' : 'Registrar anotación' }}
        </button>
      </section>

      <section *ngIf="actionMessage" class="bg-secondary-container/30 border border-secondary/20 rounded-xl p-4 mb-5">
        <p class="text-sm text-on-secondary-container">{{ actionMessage }}</p>
      </section>

      <section class="bg-surface rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-surface-container-low border-b border-outline-variant/50">
                <th class="px-6 py-4 text-xs uppercase text-on-surface-variant">Fecha</th>
                <th class="px-6 py-4 text-xs uppercase text-on-surface-variant">Estudiante</th>
                <th class="px-6 py-4 text-xs uppercase text-on-surface-variant">Tipo</th>
                <th class="px-6 py-4 text-xs uppercase text-on-surface-variant">Severidad</th>
                <th class="px-6 py-4 text-xs uppercase text-on-surface-variant">Estado</th>
                <th class="px-6 py-4 text-xs uppercase text-on-surface-variant">Descripción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/20">
              <tr *ngIf="!filteredAnnotations.length">
                <td colspan="6" class="px-6 py-4 text-sm text-on-surface-variant">Sin anotaciones registradas para los filtros seleccionados.</td>
              </tr>
              <tr *ngFor="let annotation of filteredAnnotations" class="hover:bg-surface-container-low/50">
                <td class="px-6 py-4 text-sm text-on-surface-variant">{{ annotation.createdAt | date: 'dd/MM/yyyy' }}</td>
                <td class="px-6 py-4 font-medium">{{ annotation.studentName }}</td>
                <td class="px-6 py-4"><span class="px-2 py-1 rounded-full text-xs bg-[#E0E7FF] text-[#3730A3]">{{ annotation.type }}</span></td>
                <td class="px-6 py-4"><span class="px-2 py-1 rounded-full text-xs" [ngClass]="severityClass(annotation.severity)">{{ annotation.severity }}</span></td>
                <td class="px-6 py-4 text-on-surface-variant">{{ annotation.status }}</td>
                <td class="px-6 py-4 text-sm text-on-surface-variant">
                  <p class="font-medium text-on-surface">{{ annotation.title }}</p>
                  <p>{{ annotation.description }}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </ng-container>
  `
})
export class AnnotationsComponent implements OnInit {
  private readonly coursesService = inject(CoursesService);
  private readonly annotationsService = inject(AnnotationsService);

  courses: CourseResponse[] = [];
  students: CourseStudentResponse[] = [];
  annotations: AnnotationResponse[] = [];
  selectedCourseId: number | null = null;
  selectedStudentId: number | null = null;
  selectedTypeFilter: AnnotationType | null = null;
  selectedSeverityFilter: AnnotationSeverity | null = null;
  loading = true;
  error = '';
  actionMessage = '';
  saving = false;

  readonly annotationTypes: AnnotationType[] = ['ACADEMICA', 'CONDUCTUAL', 'COMUNICACION'];
  readonly annotationSeverities: AnnotationSeverity[] = ['LEVE', 'MEDIA', 'ALTA'];

  get selectedCourseRole(): string | null {
    if (!this.selectedCourseId) return null;
    return this.courses.find(c => c.id === this.selectedCourseId)?.myRoleInCourse ?? null;
  }

  get isRestrictedTeacher(): boolean {
    const role = this.selectedCourseRole;
    return role === 'SUBJECT_TEACHER' || role === 'ASSISTANT';
  }

  get visibleAnnotationTypes(): AnnotationType[] {
    return this.isRestrictedTeacher
      ? ['ACADEMICA', 'COMUNICACION']
      : this.annotationTypes;
  }
  annotationDraft: {
    studentId: number | null;
    type: AnnotationType;
    severity: AnnotationSeverity;
    title: string;
    description: string;
  } = {
    studentId: null,
    type: 'COMUNICACION',
    severity: 'LEVE',
    title: '',
    description: ''
  };

  get canCreateAnnotation(): boolean {
    if (this.isRestrictedTeacher && this.annotationDraft.type === 'CONDUCTUAL') return false;
    return Boolean(this.selectedCourseId && this.annotationDraft.studentId && this.annotationDraft.title.trim() && this.annotationDraft.description.trim());
  }

  get visibleTypeFilters(): AnnotationType[] {
    return this.isRestrictedTeacher
      ? this.annotationTypes.filter(t => t !== 'CONDUCTUAL')
      : this.annotationTypes;
  }

  get filteredAnnotations(): AnnotationResponse[] {
    return this.annotations.filter((annotation) => {
      if (this.isRestrictedTeacher && annotation.type === 'CONDUCTUAL') return false;
      const byType = !this.selectedTypeFilter || annotation.type === this.selectedTypeFilter;
      const bySeverity = !this.selectedSeverityFilter || annotation.severity === this.selectedSeverityFilter;
      return byType && bySeverity;
    });
  }

  ngOnInit(): void {
    this.loadCourses();
  }

  retryLoad(): void {
    if (this.selectedCourseId) {
      this.loadStudentsAndAnnotations();
      return;
    }
    this.loadCourses();
  }

  onCourseChange(value: number | string): void {
    const normalized = Number(value);
    if (!normalized || this.selectedCourseId === normalized) {
      return;
    }
    this.selectedCourseId = normalized;
    if (this.isRestrictedTeacher && this.annotationDraft.type === 'CONDUCTUAL') {
      this.annotationDraft.type = 'COMUNICACION';
    }
    this.selectedStudentId = null;
    this.actionMessage = '';
    this.loadStudentsAndAnnotations();
  }

  onStudentFilterChange(value: number | string | null): void {
    const normalized = this.normalizeNullableNumber(value);
    this.selectedStudentId = normalized;
    this.loadAnnotations();
  }

  createAnnotation(): void {
    if (!this.canCreateAnnotation || !this.selectedCourseId || !this.annotationDraft.studentId) {
      return;
    }

    this.saving = true;
    this.actionMessage = '';

    this.annotationsService
      .create({
        studentId: this.annotationDraft.studentId,
        courseId: this.selectedCourseId,
        type: this.annotationDraft.type,
        severity: this.annotationDraft.severity,
        title: this.annotationDraft.title.trim(),
        description: this.annotationDraft.description.trim()
      })
      .subscribe({
        next: () => {
          this.saving = false;
          this.actionMessage = 'Anotación registrada correctamente.';
          this.resetDraft();
          this.loadAnnotations();
        },
        error: () => {
          this.saving = false;
          this.actionMessage = 'No fue posible registrar la anotacion.';
        }
      });
  }

  severityClass(severity: string): string {
    if (severity === 'ALTA') {
      return 'bg-[#FECACA] text-[#991B1B]';
    }
    if (severity === 'MEDIA') {
      return 'bg-[#FEF08A] text-[#854D0E]';
    }
    return 'bg-[#E2E8F0] text-[#475569]';
  }

  normalizeNullableNumber(value: number | string | null): number | null {
    if (value === null || value === '') {
      return null;
    }
    const normalized = Number(value);
    return Number.isFinite(normalized) && normalized > 0 ? normalized : null;
  }

  normalizeFilter(value: string | null): any {
    return value && value !== '' ? value : null;
  }

  private loadCourses(): void {
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
        this.loadStudentsAndAnnotations();
      },
      error: () => {
        this.error = 'No fue posible cargar la informacion. Intenta nuevamente.';
        this.loading = false;
      }
    });
  }

  private loadStudentsAndAnnotations(): void {
    if (!this.selectedCourseId) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.coursesService.students(this.selectedCourseId).subscribe({
      next: (students) => {
        this.students = students;
        this.annotationDraft.studentId = students[0]?.id ?? null;
        this.loadAnnotations();
      },
      error: (err) => {
        if (err?.status === 403) {
          this.students = [];
          this.annotations = [];
          this.annotationDraft.studentId = null;
        } else {
          this.error = 'No fue posible cargar la informacion. Intenta nuevamente.';
        }
        this.loading = false;
      }
    });
  }

  private loadAnnotations(): void {
    if (!this.selectedCourseId) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.annotationsService
      .list({
        courseId: this.selectedCourseId,
        studentId: this.selectedStudentId ?? undefined
      })
      .subscribe({
        next: (annotations) => {
          this.annotations = annotations;
          this.loading = false;
        },
        error: (err) => {
          if (err?.status === 403) {
            this.annotations = [];
          } else {
            this.error = 'No fue posible cargar la informacion. Intenta nuevamente.';
          }
          this.loading = false;
        }
      });
  }

  private resetDraft(): void {
    this.annotationDraft = {
      studentId: this.students[0]?.id ?? null,
      type: 'COMUNICACION',
      severity: 'LEVE',
      title: '',
      description: ''
    };
  }
}
