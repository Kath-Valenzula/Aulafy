import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RoleName } from '../../shared/models/aulafy.models';
import { AuthService } from '../auth/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const roles = route.data['roles'] as RoleName[] | undefined;
  const authService = inject(AuthService);
  const router = inject(Router);
  return !roles || authService.hasAnyRole(roles) ? true : router.createUrlTree(['/app/dashboard']);
};
