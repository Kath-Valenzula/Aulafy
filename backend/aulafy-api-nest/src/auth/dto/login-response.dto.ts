import { UserResponseDto } from '../../users/dto/user-response.dto';

export interface LoginResponseDto {
  token: string;
  tokenType: string;
  user: UserResponseDto;
}
