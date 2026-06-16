import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AcademicService } from '../../core/services/academic.service';
import { CoursesService } from '../../core/services/courses.service';
import { CourseResponse, SubjectResponse } from '../../shared/models/aulafy.models';

@Component({
  selector: 'app-subjects',
  imports: [CommonModule, FormsModule],
  template: `
    <section class="mb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h2 class="text-3xl font-bold text-primary">Asignaturas</h2>
        <p class="text-on-surface-variant mt-1">Vista administrativa de asignaturas por curso.</p>
      </div>
      <select
        class="bg-surface border border-outline-variant rounded-lg px-4 py-2.5"
        [ngModel]="selectedCourseId"
        (ngModelChange)="onCourseChange($event)"
      >
        <option *ngFor="let course of courses" [value]="course.id">{{ course.name }}</option>
      </select>
    </section>

    <section *ngIf="loading" class="bg-surface rounded-xl border border-outline-variant p-4 text-sm text-on-surface-variant">
      Cargando asignaturas...
    </section>

    <section *ngIf="!loading && error" class="bg-error-container text-on-error-container rounded-xl p-4 text-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
      <span>{{ error }}</span>
      <button (click)="retryLoad()" class="px-3 py-2 rounded-lg bg-surface text-primary font-semibold">Reintentar</button>
    </section>

    <section *ngIf="!loading && !error && !courses.length" class="bg-surface rounded-xl border border-outline-variant p-4 text-sm text-on-surface-variant">
      No hay cursos disponibles para consultar asignaturas.
    </section>

    <section *ngIf="!loading && !error && courses.length" class="bg-surface rounded-xl border border-outline-variant overflow-hidden">
      <div class="p-4 border-b border-outline-variant flex items-center justify-between">
        <div>
          <h3 class="font-semibold text-primary">{{ selectedCourseName }}</h3>
          <p class="text-sm text-on-surface-variant">{{ subjects.length }} asignatura(s) registrada(s)</p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-surface-container-low">
            <tr>
              <th class="p-4 text-left text-xs uppercase text-on-surface-variant">Asignatura</th>
              <th class="p-4 text-left text-xs uppercase text-on-surface-variant">Curso</th>
              <th class="p-4 text-left text-xs uppercase text-on-surface-variant">Profesor</th>
              <th class="p-4 text-center text-xs uppercase text-on-surface-variant">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="!subjects.length">
              <td colspan="4" class="p-4 text-sm text-on-surface-variant">El curso seleccionado no tiene asignaturas registradas.</td>
            </tr>
            <tr *ngFor="let subject of subjects" class="border-t border-outline-variant/30">
              <td class="p-4 font-medium">{{ subject.name }}</td>
              <td class="p-4">{{ subject.courseName }}</td>
              <td class="p-4">{{ subject.teacherName || 'Sin profesor asignado' }}</td>
              <td class="p-4 text-center">
                <span class="text-xs px-2 py-1 rounded-full" [ngClass]="subject.active ? 'bg-secondary/10 text-secondary' : 'bg-surface-variant text-on-surface-variant'">
                  {{ subject.active ? 'Activa' : 'Inactiva' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `
})
export class SubjectsComponent implements OnInit {
  private readonly coursesService = inject(CoursesService);
  private readonly academicService = inject(AcademicService);

  courses: CourseResponse[] = [];
  subjects: SubjectResponse[] = [];
  selectedCourseId: number | null = null;
  loading = true;
  error = '';

  get selectedCourseName(): string {
    return this.courses.find((course) => course.id === this.selectedCourseId)?.name ?? 'Curso';
  }

  ngOnInit(): void {
    this.loadCourses();
  }

  retryLoad(): void {
    if (this.selectedCourseId) {
      this.loadSubjects(this.selectedCourseId);
      return;
    }
    this.loadCourses();
  }

  onCourseChange(value: number | string): void {
    const courseId = Number(value);
    if (!courseId || courseId === this.selectedCourseId) {
      return;
    }
    this.selectedCourseId = courseId;
    this.loadSubjects(courseId);
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
        this.loadSubjects(courses[0].id);
      },
      error: (error) => {
        console.error('Error al cargar cursos para asignaturas', error);
        this.error = 'No fue posible cargar la informacion. Intenta nuevamente.';
        this.loading = false;
      }
    });
  }

  private loadSubjects(courseId: number): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      subjects: this.academicService.subjects(courseId)
    }).subscribe({
      next: ({ subjects }) => {
        this.subjects = subjects;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar asignaturas', error);
        this.error = 'No fue posible cargar la informacion. Intenta nuevamente.';
        this.loading = false;
      }
    });
  }
}
