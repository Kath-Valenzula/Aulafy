import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { catchError, finalize, of, timeout } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { RiskService } from '../../core/services/risk.service';
import { TeacherPermissionsService } from '../../core/services/teacher-permissions.service';
import { RiskReportResponse, RiskStudentResponse } from '../../shared/models/aulafy.models';

const RISK_REPORT_TIMEOUT_MS = 12000;

@Component({
  selector: 'app-risk',
  imports: [CommonModule],
  template: `
    <section *ngIf="isAccessBlocked" class="bg-surface-variant rounded-xl border border-outline-variant p-5 mb-5">
      <h2 class="text-xl font-bold text-on-surface-variant mb-1">Acceso restringido</h2>
      <p class="text-sm text-on-surface-variant">Las alertas de riesgo academico estan disponibles solo para profesor jefe. Consulta con el profesor jefe del curso para mas informacion.</p>
    </section>

    <ng-container *ngIf="!isAccessBlocked">
    <section class="mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-3xl font-bold text-on-background">
          {{ isProfesor ? 'Alertas de riesgo de mis cursos' : 'Reporte de Riesgo Academico' }}
        </h2>
        <p class="text-on-surface-variant">
          <ng-container *ngIf="isProfesor">
            Visualiza los estudiantes en situacion de riesgo academico o de asistencia en los cursos que tienes asignados.
          </ng-container>
          <ng-container *ngIf="!isProfesor">
            Identifica estudiantes con promedio menor a 4.0 o asistencia menor al 85% segun los registros del curso.
          </ng-container>
        </p>
      </div>
      <button
        (click)="loadRiskReport()"
        [disabled]="loading"
        class="px-4 py-2 rounded-lg bg-primary-container text-on-primary rounded-lg font-semibold disabled:opacity-50"
      >
        {{ loading ? 'Actualizando...' : 'Actualizar' }}
      </button>
    </section>

    <section *ngIf="loading" class="bg-surface rounded-xl border border-outline-variant p-4 mb-5 text-sm text-on-surface-variant">
      Cargando reporte de riesgo...
    </section>

    <section *ngIf="!loading && error" class="bg-error-container text-on-error-container rounded-xl p-4 mb-5 text-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
      <span>{{ error }}</span>
      <button (click)="loadRiskReport()" class="px-3 py-2 rounded-lg bg-surface text-primary font-semibold">Reintentar</button>
    </section>

    <ng-container *ngIf="!loading && !error && report">
      <section class="bg-surface rounded-xl p-4 shadow-sm border border-outline-variant/50 mb-5">
        <p class="text-sm text-on-surface-variant">
          Umbrales activos: promedio menor a
          <strong>{{ report.thresholds.minimumAverage }}</strong>
          o asistencia menor a
          <strong>{{ report.thresholds.minimumAttendancePercentage }}%</strong>.
        </p>
      </section>

      <section class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <article class="bg-surface rounded-xl p-6 border border-outline-variant/50">
          <p class="text-xs uppercase text-on-surface-variant">Alumnos en riesgo</p>
          <p class="text-5xl font-bold text-error mt-2">{{ report.summary.riskStudents }}</p>
          <p class="text-xs text-on-surface-variant mt-2">
            {{ report.summary.evaluatedStudents }} de {{ report.summary.totalStudents }} alumno(s) con datos evaluables.
          </p>
        </article>
        <article class="bg-surface rounded-xl p-6 border border-outline-variant/50">
          <p class="text-xs uppercase text-on-surface-variant mb-3">Motivo principal</p>
          <p class="text-sm">Rendimiento: <strong>{{ report.summary.academicRisk }}</strong></p>
          <p class="text-sm">Asistencia: <strong>{{ report.summary.attendanceRisk }}</strong></p>
          <p class="text-sm">Combinado: <strong>{{ report.summary.combinedRisk }}</strong></p>
        </article>
        <article class="bg-surface rounded-xl p-6 border border-outline-variant/50">
          <p class="text-xs uppercase text-on-surface-variant mb-3">Severidad</p>
          <div class="flex gap-4">
            <div class="text-center">
              <div class="w-12 h-12 rounded-full bg-error-container flex items-center justify-center font-bold">
                {{ report.summary.criticalRisk }}
              </div>
              <span class="text-xs">Critico</span>
            </div>
            <div class="text-center">
              <div class="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center font-bold">
                {{ report.summary.moderateRisk }}
              </div>
              <span class="text-xs">Moderado</span>
            </div>
          </div>
        </article>
      </section>

      <section *ngIf="hasInsufficientData" class="bg-surface rounded-xl border border-outline-variant p-4 text-sm text-on-surface-variant">
        No hay datos suficientes para generar el reporte de riesgo académico.
      </section>

      <section *ngIf="hasNoRiskStudents" class="bg-surface rounded-xl border border-outline-variant p-4 text-sm text-on-surface-variant">
        No hay alumnos en riesgo con los datos registrados.
      </section>

      <section *ngIf="report.items.length" class="bg-surface rounded-xl shadow-sm border border-outline-variant/50 overflow-hidden">
        <div class="p-4 border-b border-outline-variant bg-surface-bright">
          <h3 class="text-xl font-semibold">Lista priorizada de alumnos</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-surface-container-low text-xs uppercase text-on-surface-variant">
              <tr>
                <th class="p-4 text-left">Estudiante</th>
                <th class="p-4 text-left">Curso</th>
                <th class="p-4 text-center">Promedio</th>
                <th class="p-4 text-center">Asistencia</th>
                <th class="p-4 text-left">Motivo</th>
                <th class="p-4 text-left">Severidad</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/30">
              <tr *ngFor="let item of report.items">
                <td class="p-4 font-medium">{{ item.studentName }}</td>
                <td class="p-4">{{ item.courseName }}</td>
                <td class="p-4 text-center" [ngClass]="averageClass(item)">
                  {{ item.averageScore ?? 'Sin notas' }}
                </td>
                <td class="p-4 text-center" [ngClass]="attendanceClass(item)">
                  {{ item.attendancePercentage !== null ? item.attendancePercentage + '%' : 'Sin registros' }}
                </td>
                <td class="p-4">{{ reasonsLabel(item) }}</td>
                <td class="p-4">
                  <span class="px-2 py-1 rounded-full text-xs" [ngClass]="severityClass(item)">
                    {{ severityLabel(item) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </ng-container>
    </ng-container>
  `
})
export class RiskComponent implements OnInit {
  private readonly riskService = inject(RiskService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly authService = inject(AuthService);
  private readonly teacherPermissions = inject(TeacherPermissionsService);

  get isProfesor(): boolean {
    return this.authService.currentUser?.role === 'PROFESOR';
  }

  get isAccessBlocked(): boolean {
    return this.isProfesor && this.teacherPermissions.isSubjectTeacherOnly;
  }

  report: RiskReportResponse | null = null;
  loading = false;
  error = '';

  ngOnInit(): void {
    if (!this.isAccessBlocked) {
      this.loadRiskReport();
    }
  }

  loadRiskReport(): void {
    this.loading = true;
    this.error = '';

    this.riskService.academicRisk().pipe(
      timeout(RISK_REPORT_TIMEOUT_MS),
      catchError((error) => {
        console.error('Error al cargar reporte de riesgo', error);
        this.report = null;
        this.error = 'No fue posible cargar el reporte de riesgo en este momento.';
        return of(null);
      }),
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (report) => {
        if (report) {
          this.report = this.normalizeReport(report);
        }
        this.cdr.markForCheck();
      }
    });
  }

  get hasInsufficientData(): boolean {
    if (!this.report) {
      return false;
    }

    return this.report.summary.totalStudents === 0 || this.report.summary.evaluatedStudents === 0;
  }

  get hasNoRiskStudents(): boolean {
    if (!this.report || this.hasInsufficientData) {
      return false;
    }

    return !this.report.items.length;
  }

  averageClass(item: RiskStudentResponse): string {
    if (item.averageScore !== null && this.report && item.averageScore < this.report.thresholds.minimumAverage) {
      return 'text-error font-bold';
    }
    return '';
  }

  attendanceClass(item: RiskStudentResponse): string {
    if (
      item.attendancePercentage !== null &&
      this.report &&
      item.attendancePercentage < this.report.thresholds.minimumAttendancePercentage
    ) {
      return 'text-error font-bold';
    }
    return '';
  }

  severityClass(item: RiskStudentResponse): string {
    if (item.severity === 'CRITICO') {
      return 'bg-error-container text-on-error-container';
    }
    return 'bg-surface-variant text-on-surface-variant';
  }

  severityLabel(item: RiskStudentResponse): string {
    return item.severity === 'CRITICO' ? 'Critico' : 'Moderado';
  }

  reasonsLabel(item: RiskStudentResponse): string {
    return item.reasons.length ? item.reasons.join(' / ') : 'Sin motivo registrado';
  }

  private normalizeReport(report: RiskReportResponse): RiskReportResponse {
    return {
      generatedAt: report.generatedAt ?? new Date().toISOString(),
      thresholds: {
        minimumAverage: report.thresholds?.minimumAverage ?? 4,
        minimumAttendancePercentage: report.thresholds?.minimumAttendancePercentage ?? 85
      },
      summary: {
        totalStudents: report.summary?.totalStudents ?? 0,
        evaluatedStudents: report.summary?.evaluatedStudents ?? 0,
        riskStudents: report.summary?.riskStudents ?? 0,
        academicRisk: report.summary?.academicRisk ?? 0,
        attendanceRisk: report.summary?.attendanceRisk ?? 0,
        combinedRisk: report.summary?.combinedRisk ?? 0,
        criticalRisk: report.summary?.criticalRisk ?? 0,
        moderateRisk: report.summary?.moderateRisk ?? 0
      },
      items: Array.isArray(report.items) ? report.items : []
    };
  }
}
