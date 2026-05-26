import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { AcademicService } from '../../core/services/academic.service';
import { AcademicSummaryResponse, GradeResponse } from '../../shared/models/aulafy.models';

@Component({
  selector: 'app-academic',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <section class="page-heading">
      <div>
        <span class="eyebrow">Seguimiento academico</span>
        <h2>Notas</h2>
      </div>
      <div class="inline-tools">
        <input type="number" min="1" [(ngModel)]="studentId" />
        <button class="button secondary" type="button" (click)="load()">Buscar</button>
      </div>
    </section>

    <section class="summary-strip" *ngIf="summary">
      <div>
        <span>Estudiante</span>
        <strong>{{ summary.studentName }}</strong>
      </div>
      <div>
        <span>Promedio</span>
        <strong>{{ summary.averageScore | number:'1.2-2' }}</strong>
      </div>
      <div>
        <span>Estado</span>
        <strong>{{ summary.status }}</strong>
      </div>
    </section>

    <section class="work-area" *ngIf="canManage()">
      <h3>Registrar nota</h3>
      <form class="form-grid" [formGroup]="form" (ngSubmit)="create()">
        <label>
          Estudiante
          <input type="number" formControlName="studentId" />
        </label>
        <label>
          Evaluacion
          <input type="number" formControlName="evaluationId" />
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
        <button class="button primary" type="submit" [disabled]="form.invalid">Guardar nota</button>
      </form>
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
  private readonly auth = inject(AuthService);

  studentId = 5;
  grades: GradeResponse[] = [];
  summary?: AcademicSummaryResponse;
  form = this.fb.nonNullable.group({
    studentId: [5, [Validators.required]],
    evaluationId: [1, [Validators.required]],
    score: [6.0, [Validators.required, Validators.min(1), Validators.max(7)]],
    maxScore: [7.0, [Validators.required]],
    observation: ['']
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.academicService.grades(this.studentId).subscribe((grades) => this.grades = grades);
    this.academicService.summary(this.studentId).subscribe((summary) => this.summary = summary);
    this.form.patchValue({ studentId: this.studentId });
  }

  create(): void {
    if (this.form.invalid) {
      return;
    }
    const value = this.form.getRawValue();
    this.academicService.createGrade({ ...value, observation: value.observation || null }).subscribe(() => {
      this.studentId = value.studentId;
      this.load();
    });
  }

  canManage(): boolean {
    return this.auth.hasAnyRole(['ADMIN', 'COLEGIO', 'PROFESOR']);
  }
}
