import { RoleName } from '../../users/enums/role-name.enum';

export interface JwtPayload {
  sub: number;
  email: string;
  role: RoleName;
}
