import { SetMetadata } from '@nestjs/common';
import { RoleName } from '../../users/enums/role-name.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleName[]): ReturnType<typeof SetMetadata> =>
  SetMetadata(ROLES_KEY, roles);
