import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

interface StudentsQuery {
  levelId?: number;
  section?: string;
}

export interface AcademicStudentResponse {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  section: string;
  notes: string;
  active: boolean;
  level: {
    id: number;
    name: string;
    sortOrder: number;
    active: boolean;
  };
  guardianId: number | null;
  studentUserId: number | null;
}

@Injectable({ providedIn: 'root' })
export class AcademicStructureService {
  private readonly http = inject(HttpClient);

  students(query?: StudentsQuery) {
    let params = new HttpParams();
    if (query?.levelId) {
      params = params.set('levelId', query.levelId);
    }
    if (query?.section?.trim()) {
      params = params.set('section', query.section.trim());
    }

    return this.http.get<AcademicStudentResponse[]>(`${environment.apiUrl}/academic-structure/students`, {
      params
    });
  }
}
