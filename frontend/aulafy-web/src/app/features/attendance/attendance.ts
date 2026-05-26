import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { AttendanceService } from '../../core/services/attendance.service';
import { AttendanceResponse, AttendanceStatus, AttendanceSummaryResponse } from '../../shared/models/aulafy.models';

@Component({
  selector: 'app-attendance',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <section class="page-heading">
      <div>
        <span class="eyebrow">Seguimiento de asistencia</span>
        <h2>Asistencia</h2>
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
        <span>Asistencia</span>
        <strong>{{ summary.attendancePercentage | number:'1.2-2' }}%</strong>
      </div>
      <div>
        <span>Estado</span>
        <strong>{{ summary.status }}</strong>
      </div>
    </section>

    <section class="work-area" *ngIf="canManage()">
      <h3>Registrar asistencia</h3>
      <form class="form-grid" [formGroup]="form" (ngSubmit)="create()">
        <label>
          Estudiante
          <input type="number" formControlName="studentId" />
        </label>
        <label>
          Curso
          <input type="number" formControlName="courseId" />
        </label>
        <label>
          Fecha
          <input type="date" formControlName="date" />
        </label>
        <label>
          Estado
          <select formControlName="status">
            <option *ngFor="let status of statuses" [value]="status">{{ status }}</option>
          </select>
        </label>
        <label class="wide">
          Comentario
          <input formControlName="comment" />
        </label>
        <button class="button primary" type="submit" [disabled]="form.invalid">Guardar asistencia</button>
      </form>
    </section>

    <section class="table-panel">
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Curso</th>
            <th>Estado</th>
            <th>Comentario</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let record of records">
            <td>{{ record.date | date }}</td>
            <td>{{ record.courseName }}</td>
            <td><span class="status">{{ record.status }}</span></td>
            <td>{{ record.comment || '-' }}</td>
          </tr>
        </tbody>
      </table>
      <p class="empty-state" *ngIf="!records.length">No hay asistencia registrada para este estudiante.</p>
    </section>
  `
})
export class AttendanceComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly attendanceService = inject(AttendanceService);
  private readonly auth = inject(AuthService);

  studentId = 5;
  records: AttendanceResponse[] = [];
  summary?: AttendanceSummaryResponse;
  statuses: AttendanceStatus[] = ['PRESENTE', 'AUSENTE', 'JUSTIFICADO', 'ATRASADO'];
  form = this.fb.nonNullable.group({
    studentId: [5, [Validators.required]],
    courseId: [1, [Validators.required]],
    date: [new Date().toISOString().slice(0, 10), [Validators.required]],
    status: ['PRESENTE' as AttendanceStatus, [Validators.required]],
    comment: ['']
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.attendanceService.records(this.studentId).subscribe((records) => this.records = records);
    this.attendanceService.summary(this.studentId).subscribe((summary) => this.summary = summary);
    this.form.patchValue({ studentId: this.studentId });
  }

  create(): void {
    if (this.form.invalid) {
      return;
    }
    const value = this.form.getRawValue();
    this.attendanceService.create({ ...value, comment: value.comment || null }).subscribe(() => {
      this.studentId = value.studentId;
      this.load();
    });
  }

  canManage(): boolean {
    return this.auth.hasAnyRole(['ADMIN', 'COLEGIO', 'PROFESOR']);
  }
}
