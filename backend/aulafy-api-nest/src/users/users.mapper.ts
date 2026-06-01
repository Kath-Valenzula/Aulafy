import { UserResponseDto } from './dto/user-response.dto';
import { UserEntity } from './entities/user.entity';

export function toUserResponse(user: UserEntity): UserResponseDto {
  return {
    id: Number(user.id),
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    active: user.active,
    telegramChatId: user.telegramChatId,
    createdAt: user.createdAt
  };
}
