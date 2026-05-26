import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationsService } from '../../core/services/notifications.service';
import { NotificationLogResponse } from '../../shared/models/aulafy.models';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-heading">
      <div>
        <span class="eyebrow">Notificaciones</span>
        <h2>Telegram</h2>
      </div>
      <button class="button secondary" type="button" (click)="test()">Mensaje de prueba</button>
    </section>

    <section class="work-area">
      <h3>Enviar mensaje</h3>
      <form class="form-grid" [formGroup]="form" (ngSubmit)="send()">
        <label>
          Chat id
          <input formControlName="chatId" />
        </label>
        <label class="wide">
          Mensaje
          <textarea rows="4" formControlName="message"></textarea>
        </label>
        <button class="button primary" type="submit" [disabled]="form.invalid">Enviar</button>
      </form>
    </section>

    <section class="work-area" *ngIf="lastLog">
      <h3>Ultimo resultado</h3>
      <div class="log-box">
        <span class="status">{{ lastLog.status }}</span>
        <p>{{ lastLog.message }}</p>
        <small>{{ lastLog.detail || 'Sin detalle adicional' }}</small>
      </div>
    </section>
  `
})
export class NotificationsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly notificationsService = inject(NotificationsService);

  lastLog?: NotificationLogResponse;
  form = this.fb.nonNullable.group({
    chatId: [''],
    message: ['Recordatorio importante desde Aulafy.', [Validators.required]]
  });

  test(): void {
    this.notificationsService.test().subscribe((log) => this.lastLog = log);
  }

  send(): void {
    if (this.form.invalid) {
      return;
    }
    const value = this.form.getRawValue();
    this.notificationsService.send(value.message, value.chatId || null).subscribe((log) => this.lastLog = log);
  }
}
