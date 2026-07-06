import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/auth/auth.service';
import { TeacherPermissionsService } from '../../core/services/teacher-permissions.service';
import { ChatMessageResponse, ChatRoomResponse } from '../../shared/models/aulafy.models';

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

    <section *ngIf="loadingRooms" class="bg-surface rounded-xl border border-outline-variant p-3 text-sm text-on-surface-variant mb-4">
      Cargando conversaciones...
    </section>

    <section *ngIf="!loadingRooms && !rooms.length && !roomError" class="bg-surface rounded-xl border border-outline-variant p-4 text-sm text-on-surface-variant mb-4">
      No hay conversaciones activas para tu cuenta.
    </section>

    <section *ngIf="!loadingRooms && rooms.length" class="mb-4">
      <label class="block text-sm text-on-surface-variant mb-2">Conversación</label>
      <select
        [ngModel]="selectedRoomId"
        (ngModelChange)="onRoomChange($event)"
        class="w-full bg-surface border border-outline-variant rounded-lg p-2.5"
      >
        <option *ngFor="let room of rooms" [ngValue]="room.id">{{ room.name }} · {{ room.courseName }}</option>
      </select>
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
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly teacherPermissions = inject(TeacherPermissionsService);
  private readonly cdr = inject(ChangeDetectorRef);

  get isAccessBlocked(): boolean {
    return this.authService.currentUser?.role === 'PROFESOR' && this.teacherPermissions.isSubjectTeacherOnly;
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

  get selectedRoom(): ChatRoomResponse | undefined {
    return this.rooms.find((room) => room.id === this.selectedRoomId);
  }

  ngOnInit(): void {
    if (!this.isAccessBlocked) {
      this.loadRooms();
    }
  }

  loadRooms(): void {
    this.loadingRooms = true;
    this.roomError = '';

    this.chatService.rooms().subscribe({
      next: (rooms) => {
        this.rooms = rooms;
        this.loadingRooms = false;

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
}
