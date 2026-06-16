import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RoleName } from '../../shared/models/aulafy.models';
import { AuthService } from '../auth/auth.service';
import { hasRoleAccess, homePathForRole } from '../navigation/role-navigation';

export const roleGuard: CanActivateFn = (route, state) => {
  const roles = route.data['roles'] as RoleName[] | undefined;
  const authService = inject(AuthService);
  const router = inject(Router);
  const role = authService.currentUser?.role;

  if (hasRoleAccess(roles, role)) {
    return true;
  }

  const fallback = homePathForRole(role);
  if (state.url === fallback) {
    return router.parseUrl('/login');
  }

  return router.parseUrl(fallback);
};
