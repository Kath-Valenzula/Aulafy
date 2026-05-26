import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CoursesService } from '../../core/services/courses.service';
import { CourseResponse } from '../../shared/models/aulafy.models';

@Component({
  selector: 'app-courses',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-heading">
      <div>
        <span class="eyebrow">Administracion</span>
        <h2>Cursos</h2>
      </div>
    </section>

    <section class="work-area">
      <h3>Crear curso</h3>
      <form class="form-grid" [formGroup]="form" (ngSubmit)="create()">
        <label>
          Nombre
          <input formControlName="name" />
        </label>
        <label>
          Nivel
          <input formControlName="level" />
        </label>
        <label>
          Seccion
          <input formControlName="section" />
        </label>
        <label>
          Establecimiento
          <input formControlName="schoolName" />
        </label>
        <button class="button primary" type="submit" [disabled]="form.invalid">Guardar</button>
      </form>
    </section>

    <section class="course-grid">
      <article class="course-card" *ngFor="let course of courses">
        <h3>{{ course.name }}</h3>
        <p>{{ course.schoolName }}</p>
        <div>
          <span>{{ course.level }}</span>
          <span>Seccion {{ course.section }}</span>
          <span>{{ course.studentCount }} estudiantes</span>
          <span>{{ course.teacherCount }} docentes</span>
        </div>
      </article>
    </section>
  `
})
export class CoursesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly coursesService = inject(CoursesService);

  courses: CourseResponse[] = [];
  form = this.fb.nonNullable.group({
    name: ['6 Basico B', [Validators.required]],
    level: ['6 Basico', [Validators.required]],
    section: ['B', [Validators.required]],
    schoolName: ['Establecimiento Demo Aulafy', [Validators.required]]
  });

  ngOnInit(): void {
    this.load();
  }

  create(): void {
    if (this.form.invalid) {
      return;
    }
    this.coursesService.create(this.form.getRawValue()).subscribe((course) => {
      this.courses = [...this.courses, course];
      this.form.reset({ name: '', level: '', section: '', schoolName: '' });
    });
  }

  private load(): void {
    this.coursesService.findAll().subscribe((courses) => this.courses = courses);
  }
}
