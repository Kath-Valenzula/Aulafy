import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { AcademicService } from '../../core/services/academic.service';
import { CoursesService } from '../../core/services/courses.service';
import {
  AcademicSummaryResponse,
  CourseResponse,
  EvaluationResponse,
  EvaluationType,
  GradeResponse,
  SubjectResponse
} from '../../shared/models/aulafy.models';

@Component({
  selector: 'app-academic',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <section class="page-heading">
      <div>
        <span class="eyebrow">Seguimiento academico</span>
        <h2>Notas y evaluaciones</h2>
      </div>
      <div class="inline-tools">
        <select [value]="selectedCourseId || ''" (change)="selectCourse($event)">
          <option value="" disabled>Curso</option>
          <option *ngFor="let course of courses" [value]="course.id">{{ course.name }}</option>
        </select>
        <input type="number" min="1" [(ngModel)]="studentId" aria-label="Estudiante" />
        <button class="button secondary" type="button" (click)="loadStudentData()">Buscar</button>
      </div>
    </section>

    <p class="error" *ngIf="error">{{ error }}</p>

    <section class="summary-strip" *ngIf="summary">
      <div>
        <span>Estudiante</span>
        <strong>{{ summary.studentName }}</strong>
      </div>
      <div>
        <span>Promedio</span>
        <strong>{{ summary.gradeCount ? (summary.averageScore | number:'1.2-2') : '-' }}</strong>
      </div>
      <div>
        <span>Estado</span>
        <strong>{{ summary.status }}</strong>
      </div>
      <div>
        <span>Resumen</span>
        <strong>{{ summary.message }}</strong>
      </div>
    </section>

    <section class="work-area" *ngIf="canManage()">
      <h3>Nueva evaluacion</h3>
      <form class="form-grid" [formGroup]="evaluationForm" (ngSubmit)="createEvaluation()">
        <label>
          Asignatura
          <select formControlName="subjectId">
            <option [ngValue]="0" disabled>Seleccione asignatura</option>
            <option *ngFor="let subject of subjects" [ngValue]="subject.id">{{ subject.name }}</option>
          </select>
        </label>
        <label>
          Tipo
          <select formControlName="type">
            <option *ngFor="let type of evaluationTypes" [value]="type">{{ type }}</option>
          </select>
        </label>
        <label>
          Titulo
          <input formControlName="title" />
        </label>
        <label>
          Fecha
          <input type="date" formControlName="evaluationDate" />
        </label>
        <label>
          Ponderacion
          <input type="number" min="1" max="100" formControlName="weight" />
        </label>
        <label class="wide">
          Descripcion
          <textarea rows="3" formControlName="description"></textarea>
        </label>
        <button class="button primary" type="submit" [disabled]="evaluationForm.invalid || !selectedCourseId || !subjects.length">
          Guardar evaluacion
        </button>
      </form>
      <p class="empty-state" *ngIf="!subjects.length">No hay asignaturas activas para este curso.</p>
    </section>

    <section class="work-area" *ngIf="canManage()">
      <h3>Registrar nota</h3>
      <form class="form-grid" [formGroup]="gradeForm" (ngSubmit)="createGrade()">
        <label>
          Estudiante
          <input type="number" formControlName="studentId" />
        </label>
        <label>
          Evaluacion
          <select formControlName="evaluationId">
            <option [ngValue]="0" disabled>Seleccione evaluacion</option>
            <option *ngFor="let evaluation of evaluations" [ngValue]="evaluation.id">
              {{ evaluation.subjectName }} - {{ evaluation.title }}
            </option>
          </select>
        </label>
        <label>
          Nota
          <input type="number" step="0.1" min="1" max="7" formControlName="score" />
        </label>
        <label>
          Escala maxima
          <input type="number" step="0.1" formControlName="maxScore" />
        </label>
        <label class="wide">
          Observacion
          <input formControlName="observation" />
        </label>
        <button class="button primary" type="submit" [disabled]="gradeForm.invalid || !evaluations.length">Guardar nota</button>
      </form>
      <p class="empty-state" *ngIf="!evaluations.length">No hay evaluaciones disponibles para registrar notas.</p>
    </section>

    <section class="table-panel">
      <table>
        <thead>
          <tr>
            <th>Evaluacion</th>
            <th>Asignatura</th>
            <th>Fecha</th>
            <th>Nota</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let grade of grades">
            <td>{{ grade.evaluationTitle }}</td>
            <td>{{ grade.subjectName }}</td>
            <td>{{ grade.evaluationDate | date }}</td>
            <td><strong>{{ grade.score | number:'1.1-2' }}</strong></td>
          </tr>
        </tbody>
      </table>
      <p class="empty-state" *ngIf="!grades.length">No hay notas registradas para este estudiante.</p>
    </section>
  `
})
export class AcademicComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly academicService = inject(AcademicService);
  private readonly coursesService = inject(CoursesService);
  private readonly auth = inject(AuthService);

  courses: CourseResponse[] = [];
  subjects: SubjectResponse[] = [];
  evaluations: EvaluationResponse[] = [];
  studentId = 5;
  selectedCourseId?: number;
  grades: GradeResponse[] = [];
  summary?: AcademicSummaryResponse;
  error = '';
  evaluationTypes: EvaluationType[] = ['PRUEBA', 'CONTROL', 'TAREA', 'TRABAJO', 'PROYECTO'];

  gradeForm = this.fb.nonNullable.group({
    studentId: [5, [Validators.required]],
    evaluationId: [1, [Validators.required, Validators.min(1)]],
    score: [6.0, [Validators.required, Validators.min(1), Validators.max(7)]],
    maxScore: [7.0, [Validators.required]],
    observation: ['']
  });

  evaluationForm = this.fb.nonNullable.group({
    subjectId: [0, [Validators.required, Validators.min(1)]],
    title: ['', [Validators.required, Validators.maxLength(160)]],
    description: ['', [Validators.required]],
    type: ['PRUEBA' as EvaluationType, [Validators.required]],
    evaluationDate: [new Date().toISOString().slice(0, 10), [Validators.required]],
    weight: [30, [Validators.required, Validators.min(1), Validators.max(100)]]
  });

  ngOnInit(): void {
    this.coursesService.findAll().subscribe({
      next: (courses) => {
        this.courses = courses;
        this.selectedCourseId = courses[0]?.id;
        this.loadCourseData();
        this.loadStudentData();
      },
      error: () => this.error = 'No fue posible cargar los cursos disponibles.'
    });
  }

  selectCourse(event: Event): void {
    this.selectedCourseId = Number((event.target as HTMLSelectElement).value);
    this.loadCourseData();
  }

  loadStudentData(): void {
    this.error = '';
    this.academicService.grades(this.studentId).subscribe({
      next: (grades) => this.grades = grades,
      error: () => this.error = 'No fue posible cargar las notas para este estudiante.'
    });
    this.academicService.summary(this.studentId).subscribe({
      next: (summary) => this.summary = summary,
      error: () => this.error = 'No fue posible cargar el resumen academico.'
    });
    this.gradeForm.patchValue({ studentId: this.studentId });
  }

  createGrade(): void {
    if (this.gradeForm.invalid) {
      return;
    }
    const value = this.gradeForm.getRawValue();
    this.academicService.createGrade({ ...value, observation: value.observation || null }).subscribe({
      next: () => {
        this.studentId = value.studentId;
        this.loadStudentData();
      },
      error: () => this.error = 'No fue posible guardar la nota. Revise permisos y datos.'
    });
  }

  createEvaluation(): void {
    if (!this.selectedCourseId || this.evaluationForm.invalid) {
      return;
    }
    const value = this.evaluationForm.getRawValue();
    this.academicService.createEvaluation({
      courseId: this.selectedCourseId,
      subjectId: value.subjectId,
      title: value.title,
      description: value.description,
      type: value.type,
      evaluationDate: value.evaluationDate,
      weight: value.weight,
      active: true
    }).subscribe({
      next: (evaluation) => {
        this.evaluations = [...this.evaluations, evaluation].sort((a, b) => a.evaluationDate.localeCompare(b.evaluationDate));
        this.gradeForm.patchValue({ evaluationId: evaluation.id });
        this.evaluationForm.reset({
          subjectId: this.subjects[0]?.id || 0,
          title: '',
          description: '',
          type: 'PRUEBA',
          evaluationDate: new Date().toISOString().slice(0, 10),
          weight: 30
        });
      },
      error: () => this.error = 'No fue posible guardar la evaluacion. Revise permisos y datos.'
    });
  }

  canManage(): boolean {
    return this.auth.hasAnyRole(['ADMIN', 'COLEGIO', 'PROFESOR']);
  }

  private loadCourseData(): void {
    if (!this.selectedCourseId) {
      this.subjects = [];
      this.evaluations = [];
      return;
    }
    this.academicService.subjects(this.selectedCourseId).subscribe((subjects) => {
      this.subjects = subjects;
      this.evaluationForm.patchValue({ subjectId: subjects[0]?.id || 0 });
    });
    this.academicService.evaluations(this.selectedCourseId).subscribe((evaluations) => {
      this.evaluations = evaluations;
      this.gradeForm.patchValue({ evaluationId: evaluations[0]?.id || 0 });
    });
  }
}
