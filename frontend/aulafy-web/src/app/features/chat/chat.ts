import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../../core/services/chat.service';
import { CoursesService } from '../../core/services/courses.service';
import { AuthService } from '../../core/auth/auth.service';
import { TeacherPermissionsService } from '../../core/services/teacher-permissions.service';
import { ChatMessageResponse, ChatRoomResponse, CourseResponse } from '../../shared/models/aulafy.models';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  template: `
    <section *ngIf="isAccessBlocked" class="bg-surface-variant rounded-xl border border-outline-variant p-5 mb-5">
      <h2 class="text-xl font-bold text-on-surface-variant mb-1">Acceso restringido</h2>
      <p class="text-sm text-on-surface-variant">Los mensajes del curso estan disponibles solo para profesor jefe. Consulta con el profesor jefe del curso para comunicarte con las familias.</p>
    </section>

    <ng-container *ngIf="!isAccessBlocked">
    <section class="mb-4">
      <h2 class="text-xl font-semibold text-on-background">{{ selectedRoom?.name || 'Mensajes del curso' }}</h2>
      <p class="text-sm text-on-surface-variant">{{ selectedRoom?.courseName || 'Mensajería entre profesor y familia del curso' }}</p>
    </section>

    <section *ngIf="loadingRooms || (isHeadTeacher && loadingCourses)" class="bg-surface rounded-xl border border-outline-variant p-3 text-sm text-on-surface-variant mb-4">
      Cargando conversaciones...
    </section>

    <section *ngIf="!loadingRooms && !rooms.length && !roomError && !isHeadTeacher" class="bg-surface rounded-xl border border-outline-variant p-4 text-sm text-on-surface-variant mb-4">
      No hay conversaciones activas para tu cuenta.
    </section>

    <section *ngIf="isHeadTeacher && !loadingRooms" class="bg-surface rounded-xl border border-outline-variant p-4 mb-4">
      <h3 class="text-base font-semibold text-on-surface mb-1">Nueva sala de chat</h3>
      <p class="text-xs text-on-surface-variant mb-3">Puedes crear salas temáticas para organizar las comunicaciones de cada curso.</p>

      <p *ngIf="loadingCourses" class="text-sm text-on-surface-variant">Cargando cursos...</p>

      <p *ngIf="!loadingCourses && !headCourses.length" class="text-sm text-on-surface-variant">No tienes cursos asignados como profesor jefe.</p>

      <ng-container *ngIf="!loadingCourses && headCourses.length">
        <label class="block text-sm text-on-surface-variant mb-1">Curso</label>
        <select
          [(ngModel)]="selectedCourseIdForCreate"
          class="w-full bg-surface border border-outline-variant rounded-lg p-2.5 mb-3"
        >
          <option *ngFor="let course of headCourses" [ngValue]="course.id">{{ course.name }}</option>
        </select>

        <label class="block text-sm text-on-surface-variant mb-1">Nombre de la sala</label>
        <input
          type="text"
          [(ngModel)]="newRoomName"
          maxlength="160"
          placeholder="Ej: Comunicaciones generales"
          class="w-full bg-surface border border-outline-variant rounded-lg p-2.5 mb-3"
        />

        <button
          class="px-4 py-2 bg-primary text-on-primary rounded-lg disabled:opacity-60"
          (click)="createRoom()"
          [disabled]="creatingRoom || !selectedCourseIdForCreate || !newRoomName.trim()"
        >
          {{ creatingRoom ? 'Creando...' : 'Crear sala' }}
        </button>
      </ng-container>

      <section *ngIf="courseError" class="mt-3 bg-error-container text-on-error-container rounded-xl p-3 text-sm">
        {{ courseError }}
      </section>
    </section>

    <section *ngIf="!loadingRooms && rooms.length" class="mb-4">
      <label class="block text-sm text-on-surface-variant mb-2">Conversación</label>
      <select
        [ngModel]="selectedRoomId"
        (ngModelChange)="onRoomChange($event)"
        [disabled]="archivingRoom"
        class="w-full bg-surface border border-outline-variant rounded-lg p-2.5 mb-3"
      >
        <option *ngFor="let room of rooms" [ngValue]="room.id">{{ room.name }} · {{ room.courseName }}</option>
      </select>
      <button
        *ngIf="isHeadTeacher && selectedRoomId"
        class="flex items-center gap-1 text-sm text-error disabled:opacity-60"
        (click)="archiveRoom()"
        [disabled]="archivingRoom"
      >
        <span class="material-symbols-outlined text-base">archive</span>
        {{ archivingRoom ? 'Eliminando...' : 'Eliminar sala' }}
      </button>
    </section>

    <section *ngIf="roomError" class="bg-error-container text-on-error-container rounded-xl p-3 text-sm mb-4">
      {{ roomError }}
    </section>

    <section
      class="space-y-3 min-h-[280px] max-h-[420px] overflow-y-auto bg-surface-container-low rounded-xl border border-outline-variant p-3"
      *ngIf="selectedRoomId"
    >
      <article *ngIf="loadingMessages" class="text-sm text-on-surface-variant">Cargando mensajes...</article>

      <article
        *ngFor="let message of messages"
        class="max-w-[85%] px-4 py-3 rounded-2xl"
        [class.ml-auto]="isOwn(message)"
        [class.bg-primary]="isOwn(message)"
        [class.text-on-primary]="isOwn(message)"
        [class.rounded-br-sm]="isOwn(message)"
        [class.bg-surface-container]="!isOwn(message)"
        [class.rounded-bl-sm]="!isOwn(message)"
      >
        <p class="text-xs opacity-80 mb-1">{{ message.authorName }}</p>
        <p>{{ message.content }}</p>
        <small class="text-xs opacity-80">{{ message.createdAt | date: 'HH:mm' }}</small>
      </article>

      <article *ngIf="!loadingMessages && !messages.length" class="text-sm text-on-surface-variant">
        Aún no hay mensajes en esta conversación.
      </article>
    </section>

    <ng-container *ngIf="rooms.length && selectedRoomId">
      <section class="mt-6 p-2 bg-surface-container-low rounded-xl border border-outline-variant flex items-end gap-2">
        <textarea
          [(ngModel)]="draftMessage"
          class="flex-1 bg-transparent border-none resize-none"
          rows="2"
          placeholder="Escribe un mensaje..."
        ></textarea>
        <button
          class="p-3 bg-primary text-on-primary rounded-lg disabled:opacity-60"
          (click)="sendMessage()"
          [disabled]="sending || !draftMessage.trim()"
        >
          <span class="material-symbols-outlined">{{ sending ? 'hourglass_top' : 'send' }}</span>
        </button>
      </section>

      <section *ngIf="messageError" class="mt-3 bg-error-container text-on-error-container rounded-xl p-3 text-sm">
        {{ messageError }}
      </section>
    </ng-container>
    </ng-container>
  `
})
export class ChatComponent implements OnInit {
  private readonly chatService = inject(ChatService);
  private readonly coursesService = inject(CoursesService);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly teacherPermissions = inject(TeacherPermissionsService);
  private readonly cdr = inject(ChangeDetectorRef);

  private roomsInitialized = false;

  constructor() {
    const destroyRef = inject(DestroyRef);
    this.teacherPermissions.permissions$
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe((permissions) => {
        if (this.authService.currentUser?.role !== 'PROFESOR') {
          return;
        }
        if (!permissions.loaded) {
          return;
        }
        if (this.isAccessBlocked) {
          this.loadingRooms = false;
          this.cdr.markForCheck();
          return;
        }
        if (!this.roomsInitialized) {
          this.roomsInitialized = true;
          this.loadRooms();
        }
      });
  }

  get isAccessBlocked(): boolean {
    return this.authService.currentUser?.role === 'PROFESOR' && this.teacherPermissions.isSubjectTeacherOnly;
  }

  get isHeadTeacher(): boolean {
    return this.authService.currentUser?.role === 'PROFESOR' && this.teacherPermissions.hasHeadTeacherCourse;
  }

  rooms: ChatRoomResponse[] = [];
  messages: ChatMessageResponse[] = [];
  selectedRoomId: number | null = null;
  loadingRooms = true;
  loadingMessages = false;
  sending = false;
  draftMessage = '';
  roomError = '';
  messageError = '';
  courseError = '';
  headCourses: CourseResponse[] = [];
  loadingCourses = false;
  creatingRoom = false;
  archivingRoom = false;
  newRoomName = '';
  selectedCourseIdForCreate: number | null = null;

  get selectedRoom(): ChatRoomResponse | undefined {
    return this.rooms.find((room) => room.id === this.selectedRoomId);
  }

  ngOnInit(): void {
    if (this.authService.currentUser?.role !== 'PROFESOR') {
      this.loadRooms();
    }
    // PROFESOR: la suscripción en el constructor espera a que permissions$ emita loaded=true
  }

  loadRooms(): void {
    this.loadingRooms = true;
    this.roomError = '';

    this.chatService.rooms().subscribe({
      next: (rooms) => {
        this.rooms = rooms;
        this.loadingRooms = false;

        if (this.isHeadTeacher) {
          this.loadHeadCourses();
        }

        if (!rooms.length) {
          this.selectedRoomId = null;
          this.messages = [];
          this.cdr.markForCheck();
          return;
        }

        const roomIdParam = Number(this.route.snapshot.queryParamMap.get('roomId'));
        const initialRoomId = Number.isFinite(roomIdParam) && rooms.some((room) => room.id === roomIdParam)
          ? roomIdParam
          : rooms[0].id;
        this.onRoomChange(initialRoomId);
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadingRooms = false;
        this.roomError = 'No fue posible cargar las salas de chat.';
        this.cdr.markForCheck();
      }
    });
  }

  onRoomChange(roomId: number): void {
    this.selectedRoomId = roomId;
    this.loadMessages(roomId);
  }

  loadMessages(roomId: number): void {
    this.loadingMessages = true;
    this.messageError = '';

    this.chatService.messages(roomId).subscribe({
      next: (messages) => {
        this.messages = messages;
        this.loadingMessages = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadingMessages = false;
        this.messageError = 'No fue posible cargar los mensajes de la sala.';
        this.cdr.markForCheck();
      }
    });
  }

  sendMessage(): void {
    const content = this.draftMessage.trim();
    if (!content || !this.selectedRoomId) {
      return;
    }

    this.sending = true;
    this.messageError = '';

    this.chatService.sendMessage(this.selectedRoomId, { content }).subscribe({
      next: (message) => {
        this.sending = false;
        this.draftMessage = '';
        this.messages = [...this.messages, message];
        this.cdr.markForCheck();
      },
      error: () => {
        this.sending = false;
        this.messageError = 'No fue posible enviar el mensaje.';
        this.cdr.markForCheck();
      }
    });
  }

  isOwn(message: ChatMessageResponse): boolean {
    return message.authorId === this.authService.currentUser?.id;
  }

  private loadHeadCourses(): void {
    this.loadingCourses = true;
    this.courseError = '';
    this.coursesService.findAll().subscribe({
      next: (courses) => {
        this.headCourses = courses.filter((c) => c.myRoleInCourse === 'HEAD_TEACHER');
        this.selectedCourseIdForCreate = this.headCourses[0]?.id ?? null;
        this.loadingCourses = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.courseError = 'No fue posible cargar los cursos disponibles.';
        this.loadingCourses = false;
        this.cdr.markForCheck();
      }
    });
  }

  createRoom(): void {
    if (!this.selectedCourseIdForCreate || !this.newRoomName.trim()) {
      return;
    }
    this.creatingRoom = true;
    this.roomError = '';
    this.chatService.createRoom({ courseId: this.selectedCourseIdForCreate, name: this.newRoomName.trim() }).subscribe({
      next: (room) => {
        this.creatingRoom = false;
        if (!this.rooms.find((r) => r.id === room.id)) {
          this.rooms = [...this.rooms, room];
        }
        this.newRoomName = '';
        this.onRoomChange(room.id);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.creatingRoom = false;
        this.roomError = err?.status === 409
          ? 'Ya existe una sala activa con ese nombre para este curso.'
          : 'No fue posible crear la sala de chat.';
        this.cdr.markForCheck();
      }
    });
  }

  archiveRoom(): void {
    const roomId = this.selectedRoomId;
    if (!roomId) {
      return;
    }
    const room = this.rooms.find((r) => r.id === roomId);
    if (!confirm(`¿Eliminar la sala "${room?.name}"? Dejará de estar disponible, pero el historial se conservará para auditoría.`)) {
      return;
    }
    this.archivingRoom = true;
    this.roomError = '';
    this.chatService.archiveRoom(roomId).subscribe({
      next: () => {
        this.archivingRoom = false;
        this.rooms = this.rooms.filter((r) => r.id !== roomId);
        const next = this.rooms[0] ?? null;
        if (next) {
          this.onRoomChange(next.id);
        } else {
          this.selectedRoomId = null;
          this.messages = [];
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.archivingRoom = false;
        this.roomError = 'No fue posible eliminar la sala.';
        this.cdr.markForCheck();
      }
    });
  }
}
