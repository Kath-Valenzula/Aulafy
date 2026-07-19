import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotificationsService } from '../../core/services/notifications.service';
import { AuthService } from '../../core/auth/auth.service';
import { TeacherPermissionsService } from '../../core/services/teacher-permissions.service';
import { NotificationLogResponse } from '../../shared/models/aulafy.models';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule, FormsModule],
  template: `
    <section *ngIf="isAccessBlocked" class="bg-surface-variant rounded-xl border border-outline-variant p-5 mb-5">
      <h2 class="text-xl font-bold text-on-surface-variant mb-1">Acceso restringido</h2>
      <p class="text-sm text-on-surface-variant">Las notificaciones externas estan disponibles solo para profesor jefe.</p>
    </section>

    <ng-container *ngIf="!isAccessBlocked">
    <section class="mb-5">
      <h2 class="text-3xl font-bold text-primary">Notificaciones externas</h2>
      <p class="text-on-surface-variant">Envio opcional por Telegram con fallback controlado cuando no esta configurado.</p>
    </section>

    <section class="bg-surface rounded-xl border border-outline-variant p-5 mb-5">
      <h3 class="text-lg font-semibold mb-4">Enviar notificacion Telegram</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input [(ngModel)]="message" class="md:col-span-2 bg-surface-container border border-outline-variant rounded-lg px-3 py-2.5" placeholder="Mensaje" />
        <input [(ngModel)]="chatId" class="bg-surface-container border border-outline-variant rounded-lg px-3 py-2.5" placeholder="Chat ID (opcional)" />
      </div>
      <div class="flex flex-wrap gap-3 mt-4">
        <button
          (click)="sendTest()"
          [disabled]="sendingTest"
          class="px-4 py-2 bg-primary-container text-on-primary rounded-lg font-semibold disabled:opacity-50"
        >
          {{ sendingTest ? 'Probando...' : 'Probar Telegram' }}
        </button>
        <button
          (click)="sendMessage()"
          [disabled]="sendingMessage || !message.trim()"
          class="px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold disabled:opacity-50"
        >
          {{ sendingMessage ? 'Enviando...' : 'Enviar mensaje' }}
        </button>
      </div>
    </section>

    <section *ngIf="actionMessage" class="bg-secondary-container/30 border border-secondary/20 rounded-xl p-4 mb-5">
      <p class="text-sm text-on-secondary-container">{{ actionMessage }}</p>
    </section>

    <section *ngIf="loading" class="bg-surface rounded-xl border border-outline-variant p-4 text-sm text-on-surface-variant">
      Cargando logs de notificación...
    </section>

    <section *ngIf="!loading && error" class="bg-error-container text-on-error-container rounded-xl p-4 text-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
      <span>{{ error }}</span>
      <button (click)="loadLogs()" class="px-3 py-2 rounded-lg bg-surface text-primary font-semibold">Reintentar</button>
    </section>

    <section *ngIf="!loading && !error" class="bg-surface rounded-xl border border-outline-variant overflow-hidden">
      <div class="p-4 border-b border-outline-variant flex items-center justify-between">
        <h3 class="font-semibold">Bitácora de envíos</h3>
        <button (click)="loadLogs()" class="text-sm text-primary font-semibold">Actualizar</button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-surface-container-low border-b border-outline-variant/40">
              <th class="p-3 text-left text-xs uppercase text-on-surface-variant">Fecha</th>
              <th class="p-3 text-left text-xs uppercase text-on-surface-variant">Tipo</th>
              <th class="p-3 text-left text-xs uppercase text-on-surface-variant">Destino</th>
              <th class="p-3 text-left text-xs uppercase text-on-surface-variant">Estado</th>
              <th class="p-3 text-left text-xs uppercase text-on-surface-variant">Detalle</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="!logs.length">
              <td colspan="5" class="p-4 text-sm text-on-surface-variant">Sin registros de notificaciones aún.</td>
            </tr>
            <tr *ngFor="let log of logs" class="border-b border-outline-variant/20">
              <td class="p-3">{{ log.createdAt | date: 'dd/MM/yyyy HH:mm' }}</td>
              <td class="p-3">{{ log.type }}</td>
              <td class="p-3">{{ log.recipient }}</td>
              <td class="p-3">
                <span class="text-xs px-2 py-1 rounded-full" [ngClass]="statusClass(log.status)">
                  {{ log.status }}
                </span>
              </td>
              <td class="p-3 text-sm text-on-surface-variant">
                <p>{{ log.detail || '-' }}</p>
                <p class="text-xs mt-1">{{ log.message }}</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    </ng-container>
  `
})
export class NotificationsComponent implements OnInit {
  private readonly notificationsService = inject(NotificationsService);
  private readonly authService = inject(AuthService);
  private readonly teacherPermissions = inject(TeacherPermissionsService);

  get isAccessBlocked(): boolean {
    return this.authService.currentUser?.role === 'PROFESOR' && this.teacherPermissions.isSubjectTeacherOnly;
  }

  logs: NotificationLogResponse[] = [];
  loading = true;
  error = '';
  actionMessage = '';
  sendingTest = false;
  sendingMessage = false;
  message = 'Mensaje informativo desde Aulafy';
  chatId = '';

  ngOnInit(): void {
    if (!this.isAccessBlocked) {
      this.loadLogs();
    }
  }

  loadLogs(): void {
    this.loading = true;
    this.error = '';

    this.notificationsService.logs(100).subscribe({
      next: (logs) => {
        this.logs = logs;
        this.loading = false;
      },
      error: () => {
        this.error = 'No fue posible cargar la informacion. Intenta nuevamente.';
        this.loading = false;
      }
    });
  }

  sendTest(): void {
    this.sendingTest = true;
    this.actionMessage = '';

    this.notificationsService.test().subscribe({
      next: (result) => {
        this.sendingTest = false;
        this.actionMessage = `Prueba ejecutada con estado: ${result.status}.`;
        this.loadLogs();
      },
      error: () => {
        this.sendingTest = false;
        this.actionMessage = 'No fue posible ejecutar la prueba Telegram.';
      }
    });
  }

  sendMessage(): void {
    if (!this.message.trim()) {
      return;
    }

    this.sendingMessage = true;
    this.actionMessage = '';

    this.notificationsService.send(this.message.trim(), this.chatId.trim() || null).subscribe({
      next: (result) => {
        this.sendingMessage = false;
        this.actionMessage = `Mensaje procesado con estado: ${result.status}.`;
        this.loadLogs();
      },
      error: () => {
        this.sendingMessage = false;
        this.actionMessage = 'No fue posible enviar el mensaje.';
      }
    });
  }

  statusClass(status: string): string {
    // Estados funcionales para operacion real y modo degradado sin Telegram configurado.
    if (status === 'SENT') {
      return 'bg-secondary/10 text-secondary';
    }
    if (status === 'NOT_CONFIGURED') {
      return 'bg-[#FEF08A] text-[#854D0E]';
    }
    if (status === 'NO_RECIPIENT') {
      return 'bg-[#FEE2E2] text-[#991B1B]';
    }
    if (status === 'FAILED') {
      return 'bg-error/10 text-error';
    }
    return 'bg-surface-variant text-on-surface-variant';
  }
}
