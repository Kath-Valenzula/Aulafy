import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  AcademicSummaryResponse,
  EvaluationResponse,
  EvaluationType,
  GradeResponse,
  SubjectResponse
} from '../../shared/models/aulafy.models';

interface GradeRequest {
  studentId: number;
  evaluationId: number;
  score: number;
  maxScore: number;
  observation?: string | null;
}

interface EvaluationRequest {
  courseId: number;
  subjectId: number;
  title: string;
  description: string;
  type: EvaluationType;
  evaluationDate: string;
  weight?: number | null;
  active?: boolean;
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

  subjects(courseId: number) {
    return this.http.get<SubjectResponse[]>(`${environment.apiUrl}/courses/${courseId}/subjects`);
  }

  evaluations(courseId: number) {
    return this.http.get<EvaluationResponse[]>(`${environment.apiUrl}/courses/${courseId}/evaluations`);
  }

  createEvaluation(request: EvaluationRequest) {
    return this.http.post<EvaluationResponse>(`${environment.apiUrl}/evaluations`, request);
  }
}
