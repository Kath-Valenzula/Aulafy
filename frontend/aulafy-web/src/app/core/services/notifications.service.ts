import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { NotificationLogResponse } from '../../shared/models/aulafy.models';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly http = inject(HttpClient);

  logs(limit = 50) {
    return this.http.get<NotificationLogResponse[]>(`${environment.apiUrl}/notifications/logs`, {
      params: { limit }
    });
  }

  test() {
    return this.http.post<NotificationLogResponse>(`${environment.apiUrl}/notifications/telegram/test`, {});
  }

  send(message: string, chatId?: string | null) {
    return this.http.post<NotificationLogResponse>(`${environment.apiUrl}/notifications/telegram/send`, { message, chatId });
  }
}
