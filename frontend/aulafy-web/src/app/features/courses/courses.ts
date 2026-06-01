import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CoursesService } from '../../core/services/courses.service';
import { CourseResponse } from '../../shared/models/aulafy.models';

@Component({
  selector: 'app-courses',
  imports: [CommonModule, RouterLink],
  template: `
    <section class="mb-5">
      <h2 class="text-2xl font-semibold text-on-background">Mis Cursos</h2>
      <p class="text-sm text-on-surface-variant">Datos sincronizados desde el backend académico</p>
    </section>

    <section *ngIf="loading" class="bg-surface rounded-xl border border-outline-variant p-4 text-sm text-on-surface-variant">
      Cargando cursos...
    </section>

    <section *ngIf="!loading && error" class="bg-error-container text-on-error-container rounded-xl p-4 text-sm">
      {{ error }}
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
        </div>
        <div class="flex gap-2">
          <a routerLink="/app/feed" class="flex-1 border border-primary text-primary rounded-lg px-3 py-2 text-center text-sm font-semibold">
            Muro
          </a>
          <a routerLink="/app/messages" class="flex-1 bg-primary-container text-on-primary rounded-lg px-3 py-2 text-center text-sm font-semibold">
            Mensajes
          </a>
        </div>
      </article>
    </section>
  `
})
export class CoursesComponent implements OnInit {
  private readonly coursesService = inject(CoursesService);

  courses: CourseResponse[] = [];
  loading = true;
  error = '';

  ngOnInit(): void {
    this.coursesService.findAll().subscribe({
      next: (courses) => {
        this.courses = courses;
        this.loading = false;
      },
      error: () => {
        this.error = 'No fue posible cargar los cursos.';
        this.loading = false;
      }
    });
  }
}
