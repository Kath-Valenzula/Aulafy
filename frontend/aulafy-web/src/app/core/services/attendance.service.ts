import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AttendanceResponse, AttendanceStatus, AttendanceSummaryResponse } from '../../shared/models/aulafy.models';

interface AttendanceRequest {
  studentId: number;
  courseId: number;
  date: string;
  status: AttendanceStatus;
  comment?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private readonly http = inject(HttpClient);

  records(studentId: number) {
    return this.http.get<AttendanceResponse[]>(`${environment.apiUrl}/students/${studentId}/attendance`);
  }

  summary(studentId: number) {
    return this.http.get<AttendanceSummaryResponse>(`${environment.apiUrl}/students/${studentId}/attendance-summary`);
  }

  create(request: AttendanceRequest) {
    return this.http.post<AttendanceResponse>(`${environment.apiUrl}/attendance`, request);
  }
}
