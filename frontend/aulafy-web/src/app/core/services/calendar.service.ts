import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CalendarEventResponse, EventType } from '../../shared/models/aulafy.models';

interface CalendarEventRequest {
  title: string;
  description: string;
  type: EventType;
  startAt: string;
  endAt?: string | null;
  notifyTelegram: boolean;
}

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private readonly http = inject(HttpClient);

  findByCourse(courseId: number) {
    return this.http.get<CalendarEventResponse[]>(`${environment.apiUrl}/courses/${courseId}/events`);
  }

  create(courseId: number, request: CalendarEventRequest) {
    return this.http.post<CalendarEventResponse>(`${environment.apiUrl}/courses/${courseId}/events`, request);
  }
}
