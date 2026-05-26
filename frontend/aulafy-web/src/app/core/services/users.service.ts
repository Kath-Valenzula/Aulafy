import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { RoleName, UserResponse } from '../../shared/models/aulafy.models';

interface UserCreateRequest {
  fullName: string;
  email: string;
  password: string;
  role: RoleName;
  telegramChatId?: string | null;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);

  findAll() {
    return this.http.get<UserResponse[]>(`${environment.apiUrl}/users`);
  }

  create(request: UserCreateRequest) {
    return this.http.post<UserResponse>(`${environment.apiUrl}/users`, request);
  }

  updateStatus(id: number, active: boolean) {
    return this.http.patch<UserResponse>(`${environment.apiUrl}/users/${id}/status`, { active });
  }
}
