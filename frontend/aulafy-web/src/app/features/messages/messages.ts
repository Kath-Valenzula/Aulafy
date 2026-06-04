import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ChatService } from '../../core/services/chat.service';
import { ChatRoomResponse } from '../../shared/models/aulafy.models';

@Component({
  selector: 'app-messages',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="mb-5">
      <h2 class="text-2xl font-semibold text-on-background">Mensajes</h2>
      <p class="text-sm text-on-surface-variant">Tus conversaciones recientes</p>
    </section>

    <section *ngIf="loading" class="bg-surface rounded-xl border border-outline-variant p-4 text-sm text-on-surface-variant mb-4">
      Cargando conversaciones...
    </section>

    <section *ngIf="!loading && error" class="bg-error-container text-on-error-container rounded-xl p-4 text-sm mb-4">
      {{ error }}
    </section>

    <div class="relative mb-5">
      <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
      <input
        [(ngModel)]="searchTerm"
        class="w-full bg-surface-container-low rounded-xl py-3 pl-10 pr-4 border-none"
        placeholder="Buscar mensajes..."
      />
    </div>

    <section *ngIf="!loading && !error" class="flex flex-col gap-2">
      <a
        *ngFor="let room of filteredRooms()"
        [routerLink]="['/app/chat-profesor']"
        [queryParams]="{ roomId: room.id }"
        class="flex items-center gap-3 p-3 rounded-xl bg-surface shadow-sm border border-outline-variant"
      >
        <div class="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-semibold">
          {{ initials(room.name) }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-center gap-3">
            <h4 class="font-semibold truncate">{{ room.name }}</h4>
            <span class="text-xs text-primary">{{ room.latestMessageAt ? (room.latestMessageAt | date: 'HH:mm') : '--:--' }}</span>
          </div>
          <p class="text-sm truncate">{{ room.latestMessage || 'Sin mensajes por ahora.' }}</p>
          <p class="text-xs text-on-surface-variant truncate mt-1">{{ room.courseName }}</p>
        </div>
      </a>

      <article *ngIf="!filteredRooms().length" class="p-4 rounded-xl bg-surface border border-outline-variant text-sm text-on-surface-variant">
        No tienes conversaciones disponibles todavía.
      </article>
    </section>
  `
})
export class MessagesComponent implements OnInit {
  private readonly chatService = inject(ChatService);

  rooms: ChatRoomResponse[] = [];
  loading = true;
  error = '';
  searchTerm = '';

  ngOnInit(): void {
    this.chatService.rooms().subscribe({
      next: (rooms) => {
        this.rooms = rooms;
        this.loading = false;
      },
      error: () => {
        this.error = 'No fue posible cargar tus conversaciones.';
        this.loading = false;
      }
    });
  }

  filteredRooms(): ChatRoomResponse[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return this.rooms;
    }
    return this.rooms.filter((room) =>
      [room.name, room.courseName, room.latestMessage || ''].join(' ').toLowerCase().includes(term)
    );
  }

  initials(value: string): string {
    const tokens = value.trim().split(/\s+/).slice(0, 2);
    return tokens.map((token) => token.charAt(0).toUpperCase()).join('');
  }
}
