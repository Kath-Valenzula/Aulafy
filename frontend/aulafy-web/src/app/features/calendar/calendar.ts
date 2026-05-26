import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { CalendarService } from '../../core/services/calendar.service';
import { CoursesService } from '../../core/services/courses.service';
import { CalendarEventResponse, CourseResponse, EventType } from '../../shared/models/aulafy.models';

@Component({
  selector: 'app-calendar',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-heading">
      <div>
        <span class="eyebrow">Calendario academico</span>
        <h2>Eventos</h2>
      </div>
      <select [value]="selectedCourseId || ''" (change)="selectCourse($event)">
        <option value="" disabled>Seleccione curso</option>
        <option *ngFor="let course of courses" [value]="course.id">{{ course.name }}</option>
      </select>
    </section>

    <section class="work-area" *ngIf="canManage()">
      <h3>Nuevo evento</h3>
      <form class="form-grid" [formGroup]="form" (ngSubmit)="create()">
        <label>
          Titulo
          <input formControlName="title" />
        </label>
        <label>
          Tipo
          <select formControlName="type">
            <option *ngFor="let type of eventTypes" [value]="type">{{ type }}</option>
          </select>
        </label>
        <label>
          Inicio
          <input type="datetime-local" formControlName="startAt" />
        </label>
        <label>
          Termino
          <input type="datetime-local" formControlName="endAt" />
        </label>
        <label class="wide">
          Descripcion
          <textarea rows="3" formControlName="description"></textarea>
        </label>
        <label class="inline-check">
          <input type="checkbox" formControlName="notifyTelegram" />
          Enviar aviso por Telegram
        </label>
        <button class="button primary" type="submit" [disabled]="form.invalid || !selectedCourseId">Guardar</button>
      </form>
    </section>

    <section class="timeline">
      <article class="timeline-item" *ngFor="let event of events">
        <span class="badge warning">{{ event.type }}</span>
        <div>
          <h3>{{ event.title }}</h3>
          <p>{{ event.description }}</p>
          <small>{{ event.startAt | date:'medium' }} · {{ event.createdByName }}</small>
        </div>
      </article>
      <p class="empty-state" *ngIf="!events.length">No hay eventos registrados para este curso.</p>
    </section>
  `
})
export class CalendarComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly calendarService = inject(CalendarService);
  private readonly coursesService = inject(CoursesService);
  private readonly auth = inject(AuthService);

  courses: CourseResponse[] = [];
  events: CalendarEventResponse[] = [];
  selectedCourseId?: number;
  eventTypes: EventType[] = ['PRUEBA', 'TAREA', 'REUNION', 'ACTIVIDAD', 'COMUNICADO'];
  form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    type: ['PRUEBA' as EventType, [Validators.required]],
    startAt: [this.nowInput(), [Validators.required]],
    endAt: [''],
    notifyTelegram: [false]
  });

  ngOnInit(): void {
    this.coursesService.findAll().subscribe((courses) => {
      this.courses = courses;
      this.selectedCourseId = courses[0]?.id;
      this.loadEvents();
    });
  }

  selectCourse(event: Event): void {
    this.selectedCourseId = Number((event.target as HTMLSelectElement).value);
    this.loadEvents();
  }

  create(): void {
    if (!this.selectedCourseId || this.form.invalid) {
      return;
    }
    const value = this.form.getRawValue();
    this.calendarService.create(this.selectedCourseId, {
      ...value,
      endAt: value.endAt || null
    }).subscribe((event) => {
      this.events = [...this.events, event].sort((a, b) => a.startAt.localeCompare(b.startAt));
      this.form.reset({ title: '', description: '', type: 'PRUEBA', startAt: this.nowInput(), endAt: '', notifyTelegram: false });
    });
  }

  canManage(): boolean {
    return this.auth.hasAnyRole(['ADMIN', 'COLEGIO', 'PROFESOR']);
  }

  private loadEvents(): void {
    if (!this.selectedCourseId) {
      this.events = [];
      return;
    }
    this.calendarService.findByCourse(this.selectedCourseId).subscribe((events) => this.events = events);
  }

  private nowInput(): string {
    return new Date().toISOString().slice(0, 16);
  }
}
