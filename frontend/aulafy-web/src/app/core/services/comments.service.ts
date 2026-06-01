import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CommentResponse } from '../../shared/models/aulafy.models';

interface CommentRequest {
  content: string;
}

@Injectable({ providedIn: 'root' })
export class CommentsService {
  private readonly http = inject(HttpClient);

  findByPost(postId: number) {
    return this.http.get<CommentResponse[]>(`${environment.apiUrl}/posts/${postId}/comments`);
  }

  create(postId: number, request: CommentRequest) {
    return this.http.post<CommentResponse>(`${environment.apiUrl}/posts/${postId}/comments`, request);
  }
}
