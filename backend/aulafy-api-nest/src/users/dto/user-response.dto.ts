import { RoleName } from '../enums/role-name.enum';

export interface UserResponseDto {
  id: number;
  fullName: string;
  email: string;
  role: RoleName;
  active: boolean;
  telegramChatId: string | null;
  createdAt: Date;
}
