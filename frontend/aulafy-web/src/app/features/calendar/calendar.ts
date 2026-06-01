import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { CalendarService } from '../../core/services/calendar.service';
import { CoursesService } from '../../core/services/courses.service';
import { CalendarEventResponse, CourseResponse, EventType } from '../../shared/models/aulafy.models';

@Component({
  selector: 'app-calendar',
  imports: [CommonModule, FormsModule],
  template: `
    <ng-container *ngIf="isFamiliesExperience; else backofficeCalendar">
      <section class="mb-4 flex items-center justify-between">
        <h2 class="text-2xl font-semibold">Calendario del curso</h2>
        <select
          class="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm"
          [ngModel]="selectedCourseId"
          (ngModelChange)="onCourseChange($event)"
        >
          <option *ngFor="let course of courses" [value]="course.id">{{ course.name }}</option>
        </select>
      </section>

      <section *ngIf="loading" class="bg-surface rounded-xl p-4 border border-outline-variant mb-5 text-sm text-on-surface-variant">
        Cargando eventos...
      </section>

      <section *ngIf="!loading && error" class="bg-error-container text-on-error-container rounded-xl p-4 mb-5 text-sm">
        {{ error }}
      </section>

      <section *ngIf="!loading && !error && !events.length" class="bg-surface rounded-xl p-4 border border-outline-variant mb-5 text-sm text-on-surface-variant">
        No hay eventos para este curso.
      </section>

      <section *ngIf="!loading && !error && events.length" class="bg-surface rounded-xl p-4 border border-outline-variant mb-5">
        <div class="flex flex-col gap-2">
          <label class="text-sm text-on-surface-variant">Filtrar por fecha</label>
          <input [(ngModel)]="selectedDate" type="date" class="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2" />
        </div>
      </section>

      <section *ngIf="!loading && !error && filteredEvents.length">
        <h3 class="text-xl font-semibold mb-3">Eventos del día</h3>
        <div class="flex flex-col gap-3">
          <article *ngFor="let event of filteredEvents" class="bg-surface rounded-xl p-4 border border-outline-variant">
            <div class="text-xs uppercase font-semibold mb-1" [ngClass]="eventTypeClass(event.type)">{{ event.type }}</div>
            <h4 class="font-semibold">{{ event.title }}</h4>
            <p class="text-sm text-on-surface-variant">
              {{ event.startAt | date: 'dd/MM/yyyy HH:mm' }}
              <span *ngIf="event.endAt"> - {{ event.endAt | date: 'HH:mm' }}</span>
            </p>
            <p class="text-sm text-on-surface-variant mt-1">{{ event.description }}</p>
          </article>
        </div>
      </section>
    </ng-container>

    <ng-template #backofficeCalendar>
      <section class="mb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 class="text-3xl font-bold text-primary">Calendario Académico</h2>
          <p class="text-on-surface-variant">Gestiona y planifica actividades del semestre.</p>
        </div>
      </section>

      <section *ngIf="loading" class="bg-surface rounded-xl p-4 border border-outline-variant mb-5 text-sm text-on-surface-variant">
        Cargando calendario...
      </section>

      <section *ngIf="!loading && error" class="bg-error-container text-on-error-container rounded-xl p-4 mb-5 text-sm">
        {{ error }}
      </section>

      <section *ngIf="!loading && !error && !courses.length" class="bg-surface rounded-xl p-4 border border-outline-variant mb-5 text-sm text-on-surface-variant">
        No hay cursos disponibles para gestionar eventos.
      </section>

      <ng-container *ngIf="!loading && !error && courses.length">
        <section class="bg-surface rounded-xl p-6 border border-outline-variant shadow-sm mb-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              class="bg-background border border-outline-variant rounded-lg px-4 py-2.5"
              [ngModel]="selectedCourseId"
              (ngModelChange)="onCourseChange($event)"
            >
              <option *ngFor="let course of courses" [value]="course.id">{{ course.name }}</option>
            </select>
            <input [(ngModel)]="selectedDate" type="date" class="bg-background border border-outline-variant rounded-lg px-4 py-2.5" />
          </div>
        </section>

        <section class="bg-surface rounded-xl border border-outline-variant shadow-sm p-5 mb-5">
          <h3 class="font-semibold text-primary mb-4">Crear nuevo evento</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input [(ngModel)]="eventDraft.title" class="bg-background border border-outline-variant rounded-lg px-3 py-2.5" placeholder="Título" />
            <select
              [ngModel]="eventDraft.type"
              (ngModelChange)="eventDraft.type = $event"
              class="bg-background border border-outline-variant rounded-lg px-3 py-2.5"
            >
              <option *ngFor="let type of eventTypes" [value]="type">{{ type }}</option>
            </select>
            <input [(ngModel)]="eventDraft.startAt" type="datetime-local" class="bg-background border border-outline-variant rounded-lg px-3 py-2.5" />
            <input [(ngModel)]="eventDraft.endAt" type="datetime-local" class="bg-background border border-outline-variant rounded-lg px-3 py-2.5" />
            <input [(ngModel)]="eventDraft.description" class="bg-background border border-outline-variant rounded-lg px-3 py-2.5 md:col-span-2" placeholder="Descripción" />
            <label class="flex items-center gap-2 text-sm text-on-surface-variant md:col-span-2">
              <input [(ngModel)]="eventDraft.notifyTelegram" type="checkbox" />
              Notificar por Telegram
            </label>
          </div>
          <button
            (click)="createEvent()"
            [disabled]="saving || !canCreateEvent"
            class="mt-4 px-4 py-2 bg-[#DD6B20] text-white rounded-lg font-semibold disabled:opacity-50"
          >
            {{ saving ? 'Guardando...' : 'Crear evento' }}
          </button>
        </section>

        <section *ngIf="actionMessage" class="bg-secondary-container/30 border border-secondary/20 rounded-xl p-4 mb-5">
          <p class="text-sm text-on-secondary-container">{{ actionMessage }}</p>
        </section>

        <section class="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          <div class="p-4 border-b border-outline-variant bg-surface-bright flex justify-between items-center">
            <span class="font-semibold text-primary">{{ selectedCourseName }}</span>
            <span class="text-xs bg-surface-container-high px-2 py-1 rounded">{{ filteredEvents.length }} evento(s)</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-surface-container-low border-b border-outline-variant/40">
                  <th class="p-3 text-left text-xs uppercase text-on-surface-variant">Evento</th>
                  <th class="p-3 text-left text-xs uppercase text-on-surface-variant">Tipo</th>
                  <th class="p-3 text-left text-xs uppercase text-on-surface-variant">Inicio</th>
                  <th class="p-3 text-left text-xs uppercase text-on-surface-variant">Creador</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngIf="!filteredEvents.length" class="border-b border-outline-variant/20">
                  <td colspan="4" class="p-4 text-sm text-on-surface-variant">No hay eventos para la fecha seleccionada.</td>
                </tr>
                <tr *ngFor="let event of filteredEvents" class="border-b border-outline-variant/20">
                  <td class="p-3">
                    <p class="font-medium">{{ event.title }}</p>
                    <p class="text-xs text-on-surface-variant">{{ event.description }}</p>
                  </td>
                  <td class="p-3">{{ event.type }}</td>
                  <td class="p-3">{{ event.startAt | date: 'dd/MM/yyyy HH:mm' }}</td>
                  <td class="p-3">{{ event.createdByName }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </ng-container>
    </ng-template>
  `
})
export class CalendarComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly calendarService = inject(CalendarService);
  private readonly coursesService = inject(CoursesService);

  courses: CourseResponse[] = [];
  events: CalendarEventResponse[] = [];
  selectedCourseId: number | null = null;
  selectedDate = todayIsoDate();
  loading = true;
  error = '';
  actionMessage = '';
  saving = false;
  eventTypes: EventType[] = ['PRUEBA', 'TAREA', 'REUNION', 'ACTIVIDAD', 'COMUNICADO'];
  eventDraft: {
    title: string;
    description: string;
    type: EventType;
    startAt: string;
    endAt: string;
    notifyTelegram: boolean;
  } = {
    title: '',
    description: '',
    type: 'ACTIVIDAD',
    startAt: defaultDateTimeLocal(),
    endAt: '',
    notifyTelegram: false
  };

  get isFamiliesExperience(): boolean {
    return this.auth.hasAnyRole(['APODERADO', 'ESTUDIANTE']);
  }

  get selectedCourseName(): string {
    return this.courses.find((course) => course.id === this.selectedCourseId)?.name ?? 'Curso';
  }

  get filteredEvents(): CalendarEventResponse[] {
    if (!this.selectedDate) {
      return this.events;
    }
    return this.events.filter((event) => event.startAt.slice(0, 10) === this.selectedDate);
  }

  get canCreateEvent(): boolean {
    return Boolean(this.selectedCourseId && this.eventDraft.title.trim() && this.eventDraft.description.trim() && this.eventDraft.startAt);
  }

  ngOnInit(): void {
    this.loadCoursesAndEvents();
  }

  onCourseChange(value: number | string): void {
    const normalized = Number(value);
    if (!normalized || this.selectedCourseId === normalized) {
      return;
    }
    this.selectedCourseId = normalized;
    this.actionMessage = '';
    this.loadEvents(normalized);
  }

  createEvent(): void {
    if (!this.canCreateEvent || !this.selectedCourseId) {
      return;
    }

    this.saving = true;
    this.actionMessage = '';

    this.calendarService
      .create(this.selectedCourseId, {
        title: this.eventDraft.title.trim(),
        description: this.eventDraft.description.trim(),
        type: this.eventDraft.type,
        startAt: dateTimeLocalToIso(this.eventDraft.startAt),
        endAt: this.eventDraft.endAt ? dateTimeLocalToIso(this.eventDraft.endAt) : null,
        notifyTelegram: this.eventDraft.notifyTelegram
      })
      .subscribe({
        next: () => {
          this.saving = false;
          this.actionMessage = 'Evento creado correctamente.';
          this.resetEventDraft();
          this.loadEvents(this.selectedCourseId!);
        },
        error: () => {
          this.saving = false;
          this.actionMessage = 'No fue posible crear el evento.';
        }
      });
  }

  eventTypeClass(type: string): string {
    if (type === 'PRUEBA') {
      return 'text-error';
    }
    if (type === 'TAREA') {
      return 'text-secondary';
    }
    if (type === 'REUNION') {
      return 'text-primary';
    }
    return 'text-on-surface-variant';
  }

  private loadCoursesAndEvents(): void {
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
        this.loadEvents(courses[0].id);
      },
      error: () => {
        this.error = 'No fue posible cargar cursos para calendario.';
        this.loading = false;
      }
    });
  }

  private loadEvents(courseId: number): void {
    this.loading = true;
    this.error = '';

    this.calendarService.findByCourse(courseId).subscribe({
      next: (events) => {
        this.events = events;
        this.loading = false;
      },
      error: () => {
        this.error = 'No fue posible cargar eventos del curso.';
        this.loading = false;
      }
    });
  }

  private resetEventDraft(): void {
    this.eventDraft = {
      title: '',
      description: '',
      type: 'ACTIVIDAD',
      startAt: defaultDateTimeLocal(),
      endAt: '',
      notifyTelegram: false
    };
  }
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function defaultDateTimeLocal(): string {
  return new Date().toISOString().slice(0, 16);
}

function dateTimeLocalToIso(value: string): string {
  return new Date(value).toISOString();
}
