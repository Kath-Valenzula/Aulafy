import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PostResponse, PostType } from '../../shared/models/aulafy.models';

interface PostRequest {
  title: string;
  content: string;
  type: PostType;
  commentsEnabled: boolean;
}

@Injectable({ providedIn: 'root' })
export class PostsService {
  private readonly http = inject(HttpClient);

  findByCourse(courseId: number) {
    return this.http.get<PostResponse[]>(`${environment.apiUrl}/courses/${courseId}/posts`);
  }

  create(courseId: number, request: PostRequest) {
    return this.http.post<PostResponse>(`${environment.apiUrl}/courses/${courseId}/posts`, request);
  }
}
