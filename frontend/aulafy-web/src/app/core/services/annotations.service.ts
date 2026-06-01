import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AnnotationResponse, AnnotationSeverity, AnnotationType } from '../../shared/models/aulafy.models';

interface CreateAnnotationRequest {
  studentId: number;
  courseId: number;
  type: AnnotationType;
  severity: AnnotationSeverity;
  title: string;
  description: string;
}

interface AnnotationsQuery {
  courseId?: number;
  studentId?: number;
}

@Injectable({ providedIn: 'root' })
export class AnnotationsService {
  private readonly http = inject(HttpClient);

  list(query?: AnnotationsQuery) {
    let params = new HttpParams();
    if (query?.courseId) {
      params = params.set('courseId', query.courseId);
    }
    if (query?.studentId) {
      params = params.set('studentId', query.studentId);
    }
    return this.http.get<AnnotationResponse[]>(`${environment.apiUrl}/annotations`, { params });
  }

  create(request: CreateAnnotationRequest) {
    return this.http.post<AnnotationResponse>(`${environment.apiUrl}/annotations`, request);
  }
}
