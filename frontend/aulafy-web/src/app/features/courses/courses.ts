import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { CoursesService } from '../../core/services/courses.service';
import { CourseResponse } from '../../shared/models/aulafy.models';

@Component({
  selector: 'app-courses',
  imports: [CommonModule, RouterLink],
  template: `
    <section class="mb-5">
      <h2 class="text-2xl font-semibold text-on-background">{{ title }}</h2>
      <p class="text-sm text-on-surface-variant">{{ description }}</p>
    </section>

    <section *ngIf="loading" class="bg-surface rounded-xl border border-outline-variant p-4 text-sm text-on-surface-variant">
      Cargando cursos...
    </section>

    <section *ngIf="!loading && error" class="bg-error-container text-on-error-container rounded-xl p-4 text-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
      <span>{{ error }}</span>
      <button (click)="loadCourses()" class="px-3 py-2 rounded-lg bg-surface text-primary font-semibold">Reintentar</button>
    </section>

    <section *ngIf="!loading && !error && !courses.length" class="bg-surface rounded-xl border border-outline-variant p-4 text-sm text-on-surface-variant">
      No hay cursos visibles para tu perfil.
    </section>

    <section *ngIf="!loading && !error && courses.length" class="flex flex-col gap-4">
      <article
        *ngFor="let course of courses"
        class="bg-surface rounded-xl border border-outline-variant shadow-sm p-5 relative overflow-hidden"
      >
        <div class="absolute top-0 left-0 h-1 w-full bg-primary"></div>
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-lg font-semibold">{{ course.name }}</h3>
            <p class="text-sm text-on-surface-variant">{{ course.level }} {{ course.section }} · {{ course.schoolName }}</p>
          </div>
          <span class="bg-surface-container-high px-2 py-1 rounded-full text-xs">En curso</span>
        </div>
        <div class="bg-surface-container-low p-3 rounded-lg mb-4">
          <p class="font-medium">{{ course.studentCount }} estudiante(s)</p>
          <p class="text-sm text-on-surface-variant">{{ course.teacherCount }} profesor(es) asignado(s)</p>
          <p *ngIf="course.myRoleLabel" class="text-xs text-primary font-semibold mt-1">
            Tu rol: {{ course.myRoleLabel }}
          </p>
        </div>
        <div class="flex gap-2">
          <a *ngIf="canOpenFeed" routerLink="/app/feed" class="flex-1 border border-primary text-primary rounded-lg px-3 py-2 text-center text-sm font-semibold">
            Muro
          </a>
          <a *ngIf="canOpenAcademic" routerLink="/app/academic" class="flex-1 bg-primary-container text-on-primary rounded-lg px-3 py-2 text-center text-sm font-semibold">
            Evaluaciones
          </a>
          <a *ngIf="canOpenSubjects" routerLink="/app/subjects" class="flex-1 bg-primary-container text-on-primary rounded-lg px-3 py-2 text-center text-sm font-semibold">
            Asignaturas
          </a>
        </div>
      </article>
    </section>
  `
})
export class CoursesComponent implements OnInit {
  private readonly coursesService = inject(CoursesService);
  private readonly auth = inject(AuthService);

  courses: CourseResponse[] = [];
  loading = true;
  error = '';

  get title(): string {
    if (this.auth.hasAnyRole(['ADMIN', 'COLEGIO'])) {
      return 'Cursos';
    }
    return 'Cursos asignados';
  }

  get description(): string {
    if (this.auth.hasAnyRole(['ADMIN', 'COLEGIO'])) {
      return 'Cursos visibles segun el alcance institucional del perfil.';
    }
    return 'Cursos disponibles para gestion docente.';
  }

  get canOpenFeed(): boolean {
    return this.auth.hasAnyRole(['COLEGIO', 'PROFESOR']);
  }

  get canOpenAcademic(): boolean {
    return this.auth.hasAnyRole(['PROFESOR']);
  }

  get canOpenSubjects(): boolean {
    return this.auth.hasAnyRole(['ADMIN']);
  }

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;
    this.error = '';

    this.coursesService.findAll().subscribe({
      next: (courses) => {
        this.courses = courses;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar cursos', error);
        this.error = 'No fue posible cargar la informacion. Intenta nuevamente.';
        this.loading = false;
      }
    });
  }
}
