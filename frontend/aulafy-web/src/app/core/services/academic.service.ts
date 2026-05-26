import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AcademicSummaryResponse, GradeResponse } from '../../shared/models/aulafy.models';

interface GradeRequest {
  studentId: number;
  evaluationId: number;
  score: number;
  maxScore: number;
  observation?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AcademicService {
  private readonly http = inject(HttpClient);

  grades(studentId: number) {
    return this.http.get<GradeResponse[]>(`${environment.apiUrl}/students/${studentId}/grades`);
  }

  summary(studentId: number) {
    return this.http.get<AcademicSummaryResponse>(`${environment.apiUrl}/students/${studentId}/academic-summary`);
  }

  createGrade(request: GradeRequest) {
    return this.http.post<GradeResponse>(`${environment.apiUrl}/grades`, request);
  }
}
