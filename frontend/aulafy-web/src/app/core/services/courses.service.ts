import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CourseResponse, CourseStudentResponse, CourseTeacherResponse } from '../../shared/models/aulafy.models';

interface CourseRequest {
  name: string;
  level: string;
  section: string;
  schoolName: string;
}

@Injectable({ providedIn: 'root' })
export class CoursesService {
  private readonly http = inject(HttpClient);

  findAll() {
    return this.http.get<CourseResponse[]>(`${environment.apiUrl}/courses`);
  }

  create(request: CourseRequest) {
    return this.http.post<CourseResponse>(`${environment.apiUrl}/courses`, request);
  }

  students(courseId: number) {
    return this.http.get<CourseStudentResponse[]>(`${environment.apiUrl}/courses/${courseId}/students`);
  }

  teachers(courseId: number) {
    return this.http.get<CourseTeacherResponse[]>(`${environment.apiUrl}/courses/${courseId}/teachers`);
  }
}
