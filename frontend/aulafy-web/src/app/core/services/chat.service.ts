import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ChatMessageResponse, ChatRoomResponse } from '../../shared/models/aulafy.models';

interface CreateChatRoomRequest {
  courseId: number;
  name: string;
}

interface CreateChatMessageRequest {
  content: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly http = inject(HttpClient);

  rooms() {
    return this.http.get<ChatRoomResponse[]>(`${environment.apiUrl}/chat/rooms`);
  }

  createRoom(request: CreateChatRoomRequest) {
    return this.http.post<ChatRoomResponse>(`${environment.apiUrl}/chat/rooms`, request);
  }

  messages(roomId: number) {
    return this.http.get<ChatMessageResponse[]>(`${environment.apiUrl}/chat/rooms/${roomId}/messages`);
  }

  sendMessage(roomId: number, request: CreateChatMessageRequest) {
    return this.http.post<ChatMessageResponse>(`${environment.apiUrl}/chat/rooms/${roomId}/messages`, request);
  }

  archiveRoom(roomId: number) {
    return this.http.patch<{ id: number; archived: boolean }>(`${environment.apiUrl}/chat/rooms/${roomId}/archive`, {});
  }
}
