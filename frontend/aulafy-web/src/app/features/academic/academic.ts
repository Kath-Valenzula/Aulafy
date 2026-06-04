import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { AcademicStructureService, AcademicStudentResponse } from '../../core/services/academic-structure.service';
import { AcademicService } from '../../core/services/academic.service';
import { CoursesService } from '../../core/services/courses.service';
import {
  AcademicSummaryResponse,
  CourseResponse,
  CourseStudentResponse,
  EvaluationResponse,
  EvaluationType,
  GradeResponse,
  SubjectResponse
} from '../../shared/models/aulafy.models';

@Component({
  selector: 'app-academic',
  imports: [CommonModule, FormsModule],
  template: `
    <ng-container *ngIf="isFamiliesExperience; else backofficeAcademic">
      <section class="px-1 mb-4">
        <h2 class="text-2xl font-bold text-primary">Académico - Notas</h2>
      </section>

      <section *ngIf="loading" class="bg-surface rounded-xl border border-outline-variant p-4 mb-4 text-sm text-on-surface-variant">
        Cargando información académica...
      </section>

      <section *ngIf="!loading && error" class="bg-error-container text-on-error-container rounded-xl p-4 mb-4 text-sm">
        {{ error }}
      </section>

      <section *ngIf="!loading && !error && !students.length" class="bg-surface rounded-xl border border-outline-variant p-4 mb-4 text-sm text-on-surface-variant">
        No hay alumnos asociados para mostrar notas.
      </section>

      <ng-container *ngIf="!loading && !error && students.length">
        <section class="px-1 overflow-x-auto pb-3">
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

        <section class="bg-primary-container rounded-xl p-6 relative overflow-hidden shadow-md mb-6">
          <div class="absolute -right-12 -top-12 w-40 h-40 bg-surface-tint/20 rounded-full blur-2xl"></div>
          <div class="relative z-10">
            <h3 class="text-xs uppercase tracking-widest text-on-primary-container opacity-80">Promedio general</h3>
            <p class="text-4xl font-extrabold text-on-primary-container mt-1">{{ summary?.averageScore ?? 0 }}</p>
            <p class="text-sm text-on-primary-container mt-2">{{ summary?.message ?? 'Sin información de evaluaciones' }}</p>
          </div>
        </section>

        <section *ngIf="!gradeGroups.length" class="bg-surface rounded-xl border border-outline-variant p-4 text-sm text-on-surface-variant">
          El alumno seleccionado aún no registra notas.
        </section>

        <section *ngIf="gradeGroups.length" class="flex flex-col gap-4">
          <article *ngFor="let group of gradeGroups" class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/50 overflow-hidden">
            <div class="p-4 flex items-center justify-between bg-surface-container-low">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center text-primary">
                  <span class="material-symbols-outlined">calculate</span>
                </div>
                <div>
                  <h4 class="text-lg font-semibold">{{ group.subjectName }}</h4>
                  <p class="text-sm text-outline">{{ group.items.length }} evaluación(es)</p>
                </div>
              </div>
              <span class="text-2xl font-bold text-secondary">{{ group.average }}</span>
            </div>
            <div class="p-4 border-t border-outline-variant/30">
              <h5 class="text-xs uppercase tracking-wider text-outline mb-2">Evaluaciones pasadas</h5>
              <ul class="space-y-2">
                <li *ngFor="let item of group.items" class="flex justify-between gap-3">
                  <span>{{ item.evaluationTitle }}</span>
                  <span class="font-semibold">{{ item.score }}</span>
                </li>
              </ul>
            </div>
          </article>
        </section>
      </ng-container>
    </ng-container>

    <ng-template #backofficeAcademic>
      <section class="mb-5">
        <h2 class="text-3xl font-bold text-primary">Gestión de Calificaciones</h2>
        <p class="text-on-surface-variant mt-1">Administra y valida las notas del semestre actual.</p>
      </section>

      <section *ngIf="loading" class="bg-surface rounded-xl border border-outline-variant p-4 mb-5 text-sm text-on-surface-variant">
        Cargando cursos y evaluaciones...
      </section>

      <section *ngIf="!loading && error" class="bg-error-container text-on-error-container rounded-xl p-4 mb-5 text-sm">
        {{ error }}
      </section>

      <section *ngIf="!loading && !error && !courses.length" class="bg-surface rounded-xl border border-outline-variant p-4 mb-5 text-sm text-on-surface-variant">
        No hay cursos asignados para gestionar evaluaciones.
      </section>

      <ng-container *ngIf="!loading && !error && courses.length">
        <section class="bg-surface rounded-xl p-6 border border-outline-variant shadow-sm mb-5">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              class="bg-background border border-outline-variant rounded-lg px-4 py-2.5"
              [ngModel]="selectedCourseId"
              (ngModelChange)="onCourseChange($event)"
            >
              <option *ngFor="let course of courses" [value]="course.id">{{ course.name }}</option>
            </select>
            <select
              class="bg-background border border-outline-variant rounded-lg px-4 py-2.5"
              [ngModel]="selectedSubjectId"
              (ngModelChange)="selectedSubjectId = normalizeNullableNumber($event)"
            >
              <option value="">Todas las asignaturas</option>
              <option *ngFor="let subject of subjects" [value]="subject.id">{{ subject.name }}</option>
            </select>
            <select class="bg-background border border-outline-variant rounded-lg px-4 py-2.5">
              <option>Semestre vigente</option>
            </select>
          </div>
        </section>

        <section class="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
          <article class="bg-surface rounded-xl border border-outline-variant shadow-sm p-5">
            <h3 class="font-semibold text-primary mb-4">Registrar evaluación</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                [(ngModel)]="evaluationDraft.title"
                class="bg-background border border-outline-variant rounded-lg px-3 py-2.5"
                placeholder="Título"
              />
              <select
                [ngModel]="evaluationDraft.subjectId"
                (ngModelChange)="evaluationDraft.subjectId = normalizeNullableNumber($event)"
                class="bg-background border border-outline-variant rounded-lg px-3 py-2.5"
              >
                <option value="">Asignatura</option>
                <option *ngFor="let subject of subjects" [value]="subject.id">{{ subject.name }}</option>
              </select>
              <select
                [ngModel]="evaluationDraft.type"
                (ngModelChange)="evaluationDraft.type = $event"
                class="bg-background border border-outline-variant rounded-lg px-3 py-2.5"
              >
                <option *ngFor="let type of evaluationTypes" [value]="type">{{ type }}</option>
              </select>
              <input
                [(ngModel)]="evaluationDraft.evaluationDate"
                class="bg-background border border-outline-variant rounded-lg px-3 py-2.5"
                type="date"
              />
              <input
                [(ngModel)]="evaluationDraft.weight"
                class="bg-background border border-outline-variant rounded-lg px-3 py-2.5"
                type="number"
                min="1"
                max="100"
                placeholder="Ponderación"
              />
              <input
                [(ngModel)]="evaluationDraft.description"
                class="bg-background border border-outline-variant rounded-lg px-3 py-2.5 md:col-span-2"
                placeholder="Descripción"
              />
            </div>
            <button
              (click)="createEvaluation()"
              [disabled]="savingEvaluation || !canCreateEvaluation"
              class="mt-4 px-4 py-2 bg-primary-container text-on-primary rounded-lg font-semibold disabled:opacity-50"
            >
              {{ savingEvaluation ? 'Guardando...' : 'Crear evaluación' }}
            </button>
          </article>

          <article class="bg-surface rounded-xl border border-outline-variant shadow-sm p-5">
            <h3 class="font-semibold text-primary mb-4">Registrar nota</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                [ngModel]="gradeDraft.studentId"
                (ngModelChange)="gradeDraft.studentId = normalizeNullableNumber($event)"
                class="bg-background border border-outline-variant rounded-lg px-3 py-2.5"
              >
                <option value="">Alumno</option>
                <option *ngFor="let student of courseStudents" [value]="student.id">{{ student.fullName }}</option>
              </select>
              <select
                [ngModel]="gradeDraft.evaluationId"
                (ngModelChange)="gradeDraft.evaluationId = normalizeNullableNumber($event)"
                class="bg-background border border-outline-variant rounded-lg px-3 py-2.5"
              >
                <option value="">Evaluación</option>
                <option *ngFor="let evaluation of filteredEvaluations" [value]="evaluation.id">{{ evaluation.title }}</option>
              </select>
              <input
                [(ngModel)]="gradeDraft.score"
                class="bg-background border border-outline-variant rounded-lg px-3 py-2.5"
                type="number"
                step="0.1"
                min="1"
                max="7"
                placeholder="Nota"
              />
              <input
                [(ngModel)]="gradeDraft.maxScore"
                class="bg-background border border-outline-variant rounded-lg px-3 py-2.5"
                type="number"
                step="0.1"
                min="1"
                placeholder="Escala máxima"
              />
              <input
                [(ngModel)]="gradeDraft.observation"
                class="bg-background border border-outline-variant rounded-lg px-3 py-2.5 md:col-span-2"
                placeholder="Observación (opcional)"
              />
            </div>
            <button
              (click)="createGrade()"
              [disabled]="savingGrade || !canCreateGrade"
              class="mt-4 px-4 py-2 bg-primary-container text-on-primary rounded-lg font-semibold disabled:opacity-50"
            >
              {{ savingGrade ? 'Guardando...' : 'Registrar nota' }}
            </button>
          </article>
        </section>

        <section *ngIf="actionMessage" class="bg-secondary-container/30 border border-secondary/20 rounded-xl p-4 mb-5">
          <p class="text-sm text-on-secondary-container">{{ actionMessage }}</p>
        </section>

        <section class="bg-secondary-container/30 border border-secondary/20 rounded-xl p-4 mb-5">
          <p class="font-semibold text-on-secondary-container">Estado: sincronizado con backend</p>
          <p class="text-sm text-on-surface-variant">
            {{ filteredEvaluations.length }} evaluación(es) registrada(s) en el curso seleccionado.
          </p>
        </section>

        <section class="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          <div class="p-4 border-b border-outline-variant bg-surface-bright flex justify-between items-center">
            <span class="font-semibold text-primary">{{ selectedCourseName }}</span>
            <span class="text-xs bg-surface-container-high px-2 py-1 rounded">{{ filteredEvaluations.length }} eval.</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-surface-container-low">
                <tr>
                  <th class="p-3 text-left text-xs uppercase text-on-surface-variant">Evaluación</th>
                  <th class="p-3 text-left text-xs uppercase text-on-surface-variant">Asignatura</th>
                  <th class="p-3 text-center text-xs uppercase text-on-surface-variant">Tipo</th>
                  <th class="p-3 text-center text-xs uppercase text-on-surface-variant">Fecha</th>
                  <th class="p-3 text-center text-xs uppercase text-primary">Ponderación</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngIf="!filteredEvaluations.length" class="border-t border-outline-variant/40">
                  <td colspan="5" class="p-3 text-sm text-on-surface-variant">No hay evaluaciones para los filtros actuales.</td>
                </tr>
                <tr *ngFor="let evaluation of filteredEvaluations" class="border-t border-outline-variant/40">
                  <td class="p-3 font-medium">{{ evaluation.title }}</td>
                  <td class="p-3">{{ evaluation.subjectName }}</td>
                  <td class="p-3 text-center">{{ evaluation.type }}</td>
                  <td class="p-3 text-center">{{ evaluation.evaluationDate | date: 'dd/MM/yyyy' }}</td>
                  <td class="p-3 text-center font-semibold bg-surface-container-low">{{ evaluation.weight ?? '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </ng-container>
    </ng-template>
  `
})
export class AcademicComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly academicService = inject(AcademicService);
  private readonly coursesService = inject(CoursesService);
  private readonly academicStructureService = inject(AcademicStructureService);

  students: AcademicStudentResponse[] = [];
  selectedStudentId: number | null = null;
  summary: AcademicSummaryResponse | null = null;
  grades: GradeResponse[] = [];

  courses: CourseResponse[] = [];
  subjects: SubjectResponse[] = [];
  courseStudents: CourseStudentResponse[] = [];
  evaluations: EvaluationResponse[] = [];
  selectedCourseId: number | null = null;
  selectedSubjectId: number | null = null;
  evaluationTypes: EvaluationType[] = ['PRUEBA', 'CONTROL', 'TAREA', 'TRABAJO', 'PROYECTO'];

  evaluationDraft: {
    title: string;
    description: string;
    type: EvaluationType;
    evaluationDate: string;
    weight: number | null;
    subjectId: number | null;
  } = {
    title: '',
    description: '',
    type: 'PRUEBA',
    evaluationDate: todayIsoDate(),
    weight: null,
    subjectId: null
  };

  gradeDraft: {
    studentId: number | null;
    evaluationId: number | null;
    score: number | null;
    maxScore: number;
    observation: string;
  } = {
    studentId: null,
    evaluationId: null,
    score: null,
    maxScore: 7,
    observation: ''
  };

  loading = true;
  error = '';
  actionMessage = '';
  savingEvaluation = false;
  savingGrade = false;

  get isFamiliesExperience(): boolean {
    return this.auth.hasAnyRole(['APODERADO', 'ESTUDIANTE']);
  }

  get gradeGroups(): Array<{ subjectName: string; average: number; items: GradeResponse[] }> {
    const groups = new Map<string, GradeResponse[]>();
    for (const grade of this.grades) {
      const current = groups.get(grade.subjectName) ?? [];
      current.push(grade);
      groups.set(grade.subjectName, current);
    }

    return [...groups.entries()].map(([subjectName, items]) => ({
      subjectName,
      items,
      average: Number((items.reduce((sum, item) => sum + item.score, 0) / items.length).toFixed(2))
    }));
  }

  get filteredEvaluations(): EvaluationResponse[] {
    if (!this.selectedSubjectId) {
      return this.evaluations;
    }
    return this.evaluations.filter((evaluation) => evaluation.subjectId === this.selectedSubjectId);
  }

  get selectedCourseName(): string {
    return this.courses.find((course) => course.id === this.selectedCourseId)?.name ?? 'Curso';
  }

  get canCreateEvaluation(): boolean {
    return Boolean(
      this.selectedCourseId &&
      this.evaluationDraft.subjectId &&
      this.evaluationDraft.title.trim() &&
      this.evaluationDraft.description.trim() &&
      this.evaluationDraft.evaluationDate
    );
  }

  get canCreateGrade(): boolean {
    return Boolean(
      this.gradeDraft.studentId &&
      this.gradeDraft.evaluationId &&
      this.gradeDraft.score &&
      this.gradeDraft.maxScore > 0
    );
  }

  ngOnInit(): void {
    if (this.isFamiliesExperience) {
      this.loadFamiliesAcademicData();
      return;
    }
    this.loadBackofficeAcademicData();
  }

  selectStudent(studentId: number): void {
    if (this.selectedStudentId === studentId) {
      return;
    }
    this.selectedStudentId = studentId;
    this.fetchStudentAcademic(studentId);
  }

  onCourseChange(value: number | string): void {
    const normalized = Number(value);
    if (!normalized || this.selectedCourseId === normalized) {
      return;
    }

    this.selectedCourseId = normalized;
    this.selectedSubjectId = null;
    this.actionMessage = '';
    this.fetchCourseAcademic(normalized);
  }

  createEvaluation(): void {
    if (!this.canCreateEvaluation || !this.selectedCourseId || !this.evaluationDraft.subjectId) {
      return;
    }

    this.savingEvaluation = true;
    this.actionMessage = '';

    this.academicService
      .createEvaluation({
        courseId: this.selectedCourseId,
        subjectId: this.evaluationDraft.subjectId,
        title: this.evaluationDraft.title.trim(),
        description: this.evaluationDraft.description.trim(),
        type: this.evaluationDraft.type,
        evaluationDate: this.evaluationDraft.evaluationDate,
        weight: this.evaluationDraft.weight,
        active: true
      })
      .subscribe({
        next: () => {
          this.savingEvaluation = false;
          this.actionMessage = 'Evaluación creada correctamente.';
          this.resetEvaluationDraft();
          this.fetchCourseAcademic(this.selectedCourseId!);
        },
        error: () => {
          this.savingEvaluation = false;
          this.actionMessage = 'No fue posible crear la evaluación.';
        }
      });
  }

  createGrade(): void {
    if (!this.canCreateGrade || !this.gradeDraft.studentId || !this.gradeDraft.evaluationId || !this.gradeDraft.score) {
      return;
    }

    this.savingGrade = true;
    this.actionMessage = '';

    this.academicService
      .createGrade({
        studentId: this.gradeDraft.studentId,
        evaluationId: this.gradeDraft.evaluationId,
        score: this.gradeDraft.score,
        maxScore: this.gradeDraft.maxScore,
        observation: this.gradeDraft.observation || null
      })
      .subscribe({
        next: () => {
          this.savingGrade = false;
          this.actionMessage = 'Nota registrada correctamente.';
          this.resetGradeDraft();
        },
        error: () => {
          this.savingGrade = false;
          this.actionMessage = 'No fue posible registrar la nota.';
        }
      });
  }

  normalizeNullableNumber(value: string | number | null): number | null {
    if (value === null || value === '') {
      return null;
    }
    const normalized = Number(value);
    return Number.isFinite(normalized) && normalized > 0 ? normalized : null;
  }

  private loadFamiliesAcademicData(): void {
    this.loading = true;
    this.error = '';

    this.academicStructureService.students().subscribe({
      next: (students) => {
        this.students = students;
        if (!students.length) {
          this.loading = false;
          return;
        }

        this.selectedStudentId = students[0].id;
        this.fetchStudentAcademic(students[0].id);
      },
      error: () => {
        this.error = 'No fue posible cargar los alumnos asociados.';
        this.loading = false;
      }
    });
  }

  private fetchStudentAcademic(studentId: number): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      summary: this.academicService.summary(studentId),
      grades: this.academicService.grades(studentId)
    }).subscribe({
      next: ({ summary, grades }) => {
        this.summary = summary;
        this.grades = grades;
        this.loading = false;
      },
      error: () => {
        this.error = 'No fue posible cargar las notas del alumno seleccionado.';
        this.loading = false;
      }
    });
  }

  private loadBackofficeAcademicData(): void {
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
        this.fetchCourseAcademic(courses[0].id);
      },
      error: () => {
        this.error = 'No fue posible cargar los cursos disponibles.';
        this.loading = false;
      }
    });
  }

  private fetchCourseAcademic(courseId: number): void {
    this.loading = true;
    this.error = '';

    // Sincroniza materias, evaluaciones y alumnos del curso para formularios de registro.
    forkJoin({
      subjects: this.academicService.subjects(courseId),
      evaluations: this.academicService.evaluations(courseId),
      students: this.coursesService.students(courseId)
    }).subscribe({
      next: ({ subjects, evaluations, students }) => {
        this.subjects = subjects;
        this.evaluations = evaluations;
        this.courseStudents = students;
        this.loading = false;
        this.resetEvaluationDraft();
        this.resetGradeDraft();
      },
      error: () => {
        this.error = 'No fue posible cargar evaluaciones del curso seleccionado.';
        this.loading = false;
      }
    });
  }

  private resetEvaluationDraft(): void {
    this.evaluationDraft = {
      title: '',
      description: '',
      type: 'PRUEBA',
      evaluationDate: todayIsoDate(),
      weight: null,
      subjectId: this.subjects[0]?.id ?? null
    };
  }

  private resetGradeDraft(): void {
    this.gradeDraft = {
      studentId: this.courseStudents[0]?.id ?? null,
      evaluationId: this.filteredEvaluations[0]?.id ?? null,
      score: null,
      maxScore: 7,
      observation: ''
    };
  }
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}
